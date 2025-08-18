import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
from .services.redis_service import redis_service
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.document_subscribers: Dict[str, Set[str]] = {}
        self.user_connections: Dict[str, str] = {}  # user_id -> connection_id
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        connection_id = f"conn_{user_id}_{asyncio.get_event_loop().time()}"
        
        self.active_connections[connection_id] = websocket
        self.user_connections[user_id] = connection_id
        
        # Log connection to Supabase
        redis_service.log_realtime_event(
            event_type='websocket_connected',
            user_id=user_id,
            event_data={'connection_id': connection_id},
            ip_address=websocket.client.host if hasattr(websocket, 'client') else None
        )
        
        # Subscribe to user notifications
        await self.subscribe_to_user_notifications(user_id, connection_id)
        
        return connection_id
    
    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        # Remove from document subscriptions
        for doc_id, subscribers in self.document_subscribers.items():
            subscribers.discard(connection_id)
        
        # Remove from user connections
        user_id = None
        for uid, cid in self.user_connections.items():
            if cid == connection_id:
                user_id = uid
                break
        
        if user_id:
            del self.user_connections[user_id]
            
            # Log disconnection to Supabase
            redis_service.log_realtime_event(
                event_type='websocket_disconnected',
                user_id=user_id,
                event_data={'connection_id': connection_id}
            )
    
    async def subscribe_to_document(self, connection_id: str, document_id: str):
        if document_id not in self.document_subscribers:
            self.document_subscribers[document_id] = set()
        
        self.document_subscribers[document_id].add(connection_id)
        
        # Subscribe to Redis channel for document updates
        channel = f"document:{document_id}:updates"
        asyncio.create_task(self.listen_to_redis_channel(channel, document_id))
    
    async def unsubscribe_from_document(self, connection_id: str, document_id: str):
        if document_id in self.document_subscribers:
            self.document_subscribers[document_id].discard(connection_id)
    
    async def send_to_connection(self, connection_id: str, message: dict):
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_text(json.dumps(message))
            except:
                # Connection closed, remove it
                self.disconnect(connection_id)
    
    async def broadcast_to_document(self, document_id: str, message: dict):
        if document_id in self.document_subscribers:
            for connection_id in self.document_subscribers[document_id].copy():
                await self.send_to_connection(connection_id, message)
    
    async def send_to_user(self, user_id: str, message: dict):
        connection_id = self.user_connections.get(user_id)
        if connection_id:
            await self.send_to_connection(connection_id, message)
    
    async def listen_to_redis_channel(self, channel: str, document_id: str):
        """Listen to Redis pub/sub for real-time updates"""
        pubsub = redis_service.client.pubsub()
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    data = json.loads(message['data'])
                    await self.broadcast_to_document(document_id, {
                        'type': 'document_update',
                        'data': data
                    })
        except Exception as e:
            print(f"Error listening to Redis channel {channel}: {e}")
        finally:
            await pubsub.unsubscribe(channel)
    
    async def subscribe_to_user_notifications(self, user_id: str, connection_id: str):
        """Subscribe to user-specific notifications"""
        channel = f"user:{user_id}:notifications"
        pubsub = redis_service.client.pubsub()
        await pubsub.subscribe(channel)
        
        async def listen():
            try:
                async for message in pubsub.listen():
                    if message['type'] == 'message':
                        notification = json.loads(message['data'])
                        await self.send_to_connection(connection_id, {
                            'type': 'notification',
                            'data': notification
                        })
            except Exception as e:
                print(f"Error listening to user notifications for {user_id}: {e}")
            finally:
                await pubsub.unsubscribe(channel)
        
        asyncio.create_task(listen())

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    connection_id = await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message['type'] == 'subscribe_document':
                await manager.subscribe_to_document(connection_id, message['document_id'])
            
            elif message['type'] == 'unsubscribe_document':
                await manager.unsubscribe_from_document(connection_id, message['document_id'])
            
            elif message['type'] == 'typing_indicator':
                # Broadcast typing indicator to other document subscribers
                await manager.broadcast_to_document(message['document_id'], {
                    'type': 'typing_indicator',
                    'user_id': user_id,
                    'is_typing': message['is_typing']
                })
            
            elif message['type'] == 'ping':
                await manager.send_to_connection(connection_id, {'type': 'pong'})
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
