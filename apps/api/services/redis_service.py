import redis
import json
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import os
from supabase import create_client, Client
from postgrest import APIError

class BuffrSignRedisService:
    def __init__(self):
        # Redis configuration
        self.client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            password=os.getenv('REDIS_PASSWORD'),
            decode_responses=True,
            db=0
        )
        self.key_prefix = 'buffsign:'
        
        # Supabase configuration for persistence
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        else:
            self.supabase = None
    
    def _key(self, key: str) -> str:
        return f"{self.key_prefix}{key}"
    
    # Session Management
    def create_session(self, user_id: str, session_data: Dict[str, Any], ttl: int = 86400) -> str:
        session_id = f"session_{user_id}_{datetime.now().timestamp()}"
        session_key = self._key(f"session:{session_id}")
        
        self.client.setex(session_key, ttl, json.dumps(session_data))
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        session_key = self._key(f"session:{session_id}")
        data = self.client.get(session_key)
        return json.loads(data) if data else None
    
    def delete_session(self, session_id: str) -> bool:
        session_key = self._key(f"session:{session_id}")
        return bool(self.client.delete(session_key))
    
    # JWT Token Management
    def blacklist_token(self, token: str, expires_in: int):
        """Blacklist JWT token for secure logout"""
        token_key = self._key(f"blacklist:{token}")
        self.client.setex(token_key, expires_in, "1")
    
    def is_token_blacklisted(self, token: str) -> bool:
        token_key = self._key(f"blacklist:{token}")
        return bool(self.client.get(token_key))
    
    # Rate Limiting
    def check_rate_limit(self, identifier: str, limit: int, window: int) -> Dict[str, Any]:
        """Check rate limit for API endpoints"""
        key = self._key(f"ratelimit:{identifier}")
        
        current = self.client.incr(key)
        if current == 1:
            self.client.expire(key, window)
        
        return {
            "allowed": current <= limit,
            "remaining": max(0, limit - current),
            "reset_time": datetime.now() + timedelta(seconds=window)
        }
    
    # Caching
    def cache_set(self, key: str, data: Any, ttl: int = 3600):
        cache_key = self._key(f"cache:{key}")
        self.client.setex(cache_key, ttl, json.dumps(data))
    
    def cache_get(self, key: str) -> Optional[Any]:
        cache_key = self._key(f"cache:{key}")
        data = self.client.get(cache_key)
        return json.loads(data) if data else None
    
    def cache_delete(self, key: str) -> bool:
        cache_key = self._key(f"cache:{key}")
        return bool(self.client.delete(cache_key))
    
    def cache_invalidate_pattern(self, pattern: str) -> int:
        """Invalidate cache keys matching pattern"""
        keys = self.client.keys(self._key(f"cache:{pattern}"))
        return self.client.delete(*keys) if keys else 0
    
    # Document Status Tracking
    def set_document_status(self, document_id: str, status: str, metadata: Dict[str, Any] = None):
        """Track document status for real-time updates"""
        status_data = {
            "status": status,
            "metadata": metadata or {},
            "updated_at": datetime.now().isoformat()
        }
        
        # Store status
        status_key = self._key(f"document:{document_id}:status")
        self.client.set(status_key, json.dumps(status_data))
        
        # Publish real-time update
        channel = self._key(f"document:{document_id}:updates")
        self.client.publish(channel, json.dumps(status_data))
    
    def get_document_status(self, document_id: str) -> Optional[Dict[str, Any]]:
        status_key = self._key(f"document:{document_id}:status")
        data = self.client.get(status_key)
        return json.loads(data) if data else None
    
    # Task Queue Management
    def add_task(self, queue_name: str, task_data: Dict[str, Any], delay: int = 0):
        """Add task to queue for background processing"""
        task = {
            "id": f"task_{datetime.now().timestamp()}",
            "data": task_data,
            "created_at": datetime.now().isoformat(),
            "queue": queue_name
        }
        
        queue_key = self._key(f"queue:{queue_name}")
        
        if delay > 0:
            # Delayed task
            score = datetime.now().timestamp() + delay
            self.client.zadd(f"{queue_key}:delayed", {json.dumps(task): score})
        else:
            # Immediate task
            self.client.lpush(queue_key, json.dumps(task))
    
    def get_task(self, queue_name: str, timeout: int = 10) -> Optional[Dict[str, Any]]:
        """Get task from queue for processing"""
        queue_key = self._key(f"queue:{queue_name}")
        result = self.client.brpop(queue_key, timeout=timeout)
        
        if result:
            return json.loads(result[1])
        return None
    
    # Real-time Notifications
    def send_notification(self, user_id: str, notification: Dict[str, Any]):
        """Send real-time notification to user"""
        channel = self._key(f"user:{user_id}:notifications")
        notification_data = {
            **notification,
            "timestamp": datetime.now().isoformat(),
            "id": f"notif_{datetime.now().timestamp()}"
        }
        
        # Store notification
        notif_key = self._key(f"notifications:{user_id}")
        self.client.lpush(notif_key, json.dumps(notification_data))
        self.client.ltrim(notif_key, 0, 99)  # Keep last 100 notifications
        
        # Publish real-time
        self.client.publish(channel, json.dumps(notification_data))
    
    def get_user_notifications(self, user_id: str, limit: int = 20) -> list:
        """Get user notifications"""
        notif_key = self._key(f"notifications:{user_id}")
        notifications = self.client.lrange(notif_key, 0, limit - 1)
        return [json.loads(notif) for notif in notifications]
    
    # ETA 2019 Compliance Caching
    def cache_compliance_result(self, document_id: str, compliance_data: Dict[str, Any], ttl: int = 3600):
        """Cache compliance check results"""
        compliance_key = self._key(f"compliance:{document_id}")
        self.client.setex(compliance_key, ttl, json.dumps(compliance_data))
    
    def get_cached_compliance(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get cached compliance results"""
        compliance_key = self._key(f"compliance:{document_id}")
        data = self.client.get(compliance_key)
        return json.loads(data) if data else None

    # Supabase Integration Methods
    
    def log_user_activity(self, user_id: str, activity_type: str, activity_data: Dict[str, Any] = None, 
                         ip_address: str = None, user_agent: str = None, session_id: str = None) -> str:
        """Log user activity to Supabase"""
        if not self.supabase:
            return None
            
        try:
            result = self.supabase.rpc('log_user_activity', {
                'p_user_id': user_id,
                'p_activity_type': activity_type,
                'p_activity_data': activity_data,
                'p_ip_address': ip_address,
                'p_user_agent': user_agent,
                'p_session_id': session_id
            }).execute()
            return result.data
        except APIError as e:
            print(f"Error logging user activity: {e}")
            return None

    def update_document_processing_status(self, document_id: str, processing_type: str, status: str,
                                        progress: int = None, metadata: Dict[str, Any] = None,
                                        error_message: str = None) -> str:
        """Update document processing status in Supabase"""
        if not self.supabase:
            return None
            
        try:
            result = self.supabase.rpc('update_document_processing_status', {
                'p_document_id': document_id,
                'p_processing_type': processing_type,
                'p_status': status,
                'p_progress': progress,
                'p_metadata': metadata,
                'p_error_message': error_message
            }).execute()
            return result.data
        except APIError as e:
            print(f"Error updating document processing status: {e}")
            return None

    def add_background_task(self, queue_name: str, task_type: str, task_data: Dict[str, Any],
                           priority: int = 0, scheduled_at: datetime = None, max_attempts: int = 3) -> str:
        """Add background task to Supabase"""
        if not self.supabase:
            return None
            
        try:
            result = self.supabase.rpc('add_background_task', {
                'p_queue_name': queue_name,
                'p_task_type': task_type,
                'p_task_data': task_data,
                'p_priority': priority,
                'p_scheduled_at': scheduled_at.isoformat() if scheduled_at else None,
                'p_max_attempts': max_attempts
            }).execute()
            return result.data
        except APIError as e:
            print(f"Error adding background task: {e}")
            return None

    def get_next_background_task(self, queue_name: str) -> Optional[Dict[str, Any]]:
        """Get next background task from Supabase"""
        if not self.supabase:
            return None
            
        try:
            result = self.supabase.rpc('get_next_background_task', {
                'p_queue_name': queue_name
            }).execute()
            return result.data[0] if result.data else None
        except APIError as e:
            print(f"Error getting next background task: {e}")
            return None

    def complete_background_task(self, task_id: str, status: str = 'completed', error_message: str = None) -> bool:
        """Complete background task in Supabase"""
        if not self.supabase:
            return False
            
        try:
            result = self.supabase.rpc('complete_background_task', {
                'p_task_id': task_id,
                'p_status': status,
                'p_error_message': error_message
            }).execute()
            return result.data
        except APIError as e:
            print(f"Error completing background task: {e}")
            return False

    def log_realtime_event(self, event_type: str, channel: str = None, user_id: str = None,
                          document_id: str = None, event_data: Dict[str, Any] = None,
                          ip_address: str = None, user_agent: str = None) -> str:
        """Log real-time event to Supabase"""
        if not self.supabase:
            return None
            
        try:
            result = self.supabase.rpc('log_realtime_event', {
                'p_event_type': event_type,
                'p_channel': channel,
                'p_user_id': user_id,
                'p_document_id': document_id,
                'p_event_data': event_data,
                'p_ip_address': ip_address,
                'p_user_agent': user_agent
            }).execute()
            return result.data
        except APIError as e:
            print(f"Error logging real-time event: {e}")
            return None

    def log_rate_limit_event(self, identifier: str, limit_type: str, request_count: int,
                            window_start: datetime, window_end: datetime, is_blocked: bool,
                            ip_address: str = None, user_id: str = None) -> str:
        """Log rate limit event to Supabase"""
        if not self.supabase:
            return None
            
        try:
            result = self.supabase.rpc('log_rate_limit_event', {
                'p_identifier': identifier,
                'p_limit_type': limit_type,
                'p_request_count': request_count,
                'p_window_start': window_start.isoformat(),
                'p_window_end': window_end.isoformat(),
                'p_is_blocked': is_blocked,
                'p_ip_address': ip_address,
                'p_user_id': user_id
            }).execute()
            return result.data
        except APIError as e:
            print(f"Error logging rate limit event: {e}")
            return None

    def get_user_activity_analytics(self, user_id: str, days_back: int = 30) -> List[Dict[str, Any]]:
        """Get user activity analytics from Supabase"""
        if not self.supabase:
            return []
            
        try:
            result = self.supabase.rpc('get_user_activity_analytics', {
                'p_user_id': user_id,
                'p_days_back': days_back
            }).execute()
            return result.data
        except APIError as e:
            print(f"Error getting user activity analytics: {e}")
            return []

    def get_redis_integration_health(self) -> List[Dict[str, Any]]:
        """Get Redis integration health metrics from Supabase"""
        if not self.supabase:
            return []
            
        try:
            result = self.supabase.rpc('get_redis_integration_health').execute()
            return result.data
        except APIError as e:
            print(f"Error getting Redis integration health: {e}")
            return []

    def cleanup_expired_data(self) -> Dict[str, int]:
        """Cleanup expired data from both Redis and Supabase"""
        cleanup_stats = {}
        
        # Cleanup expired sessions from Redis
        expired_sessions = self.client.keys(f"{self.key_prefix}session:*")
        if expired_sessions:
            cleanup_stats['redis_sessions'] = len(expired_sessions)
            self.client.delete(*expired_sessions)
        
        # Cleanup expired JWT blacklist from Redis
        expired_tokens = self.client.keys(f"{self.key_prefix}blacklist:*")
        if expired_tokens:
            cleanup_stats['redis_tokens'] = len(expired_tokens)
            self.client.delete(*expired_tokens)
        
        # Cleanup expired data from Supabase
        if self.supabase:
            try:
                # Cleanup expired sessions
                result = self.supabase.rpc('cleanup_expired_sessions').execute()
                cleanup_stats['supabase_sessions'] = result.data
                
                # Cleanup expired JWT blacklist
                result = self.supabase.rpc('cleanup_expired_jwt_blacklist').execute()
                cleanup_stats['supabase_tokens'] = result.data
            except APIError as e:
                print(f"Error cleaning up expired data: {e}")
        
        return cleanup_stats

# Global Redis service instance
redis_service = BuffrSignRedisService()
