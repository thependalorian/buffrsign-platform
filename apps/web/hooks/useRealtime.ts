'use client'

import { useEffect, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import { useAuth } from './useAuth'

interface RealtimeEvent {
  type: string
  data: any
  timestamp: string
}

export function useRealtime() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', {
      auth: {
        token: localStorage.getItem('buffrsign_token')
      },
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      setConnected(true)
      console.log(' Connected to BuffrSign real-time service')
    })

    socketInstance.on('disconnect', () => {
      setConnected(false)
      console.log(' Disconnected from BuffrSign real-time service')
    })

    socketInstance.on('document_status_update', (data) => {
      const event: RealtimeEvent = {
        type: 'document_status_update',
        data,
        timestamp: new Date().toISOString()
      }
      setEvents(prev => [event, ...prev.slice(0, 99)]) // Keep last 100 events
    })

    socketInstance.on('signature_completed', (data) => {
      const event: RealtimeEvent = {
        type: 'signature_completed',
        data,
        timestamp: new Date().toISOString()
      }
      setEvents(prev => [event, ...prev.slice(0, 99)])
    })

    socketInstance.on('notification', (data) => {
      const event: RealtimeEvent = {
        type: 'notification',
        data,
        timestamp: new Date().toISOString()
      }
      setEvents(prev => [event, ...prev.slice(0, 99)])
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('BuffrSign', {
          body: data.message,
          icon: '/favicon.ico'
        })
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  const subscribeToDocument = useCallback((documentId: string) => {
    if (socket) {
      socket.emit('subscribe_document', { documentId })
    }
  }, [socket])

  const unsubscribeFromDocument = useCallback((documentId: string) => {
    if (socket) {
      socket.emit('unsubscribe_document', { documentId })
    }
  }, [socket])

  const sendTypingIndicator = useCallback((documentId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing_indicator', { documentId, isTyping })
    }
  }, [socket])

  return {
    connected,
    events,
    subscribeToDocument,
    unsubscribeFromDocument,
    sendTypingIndicator,
    clearEvents: () => setEvents([])
  }
}

// Hook for document-specific real-time updates
export function useDocumentRealtime(documentId: string) {
  const { subscribeToDocument, unsubscribeFromDocument, events } = useRealtime()
  const [documentStatus, setDocumentStatus] = useState<string>('unknown')
  const [activeUsers, setActiveUsers] = useState<string[]>([])

  useEffect(() => {
    if (documentId) {
      subscribeToDocument(documentId)
      return () => unsubscribeFromDocument(documentId)
    }
  }, [documentId, subscribeToDocument, unsubscribeFromDocument])

  useEffect(() => {
    const documentEvents = events.filter(event => 
      event.data.documentId === documentId
    )

    documentEvents.forEach(event => {
      switch (event.type) {
        case 'document_status_update':
          setDocumentStatus(event.data.status)
          break
        case 'user_joined_document':
          setActiveUsers(prev => [...prev, event.data.userId])
          break
        case 'user_left_document':
          setActiveUsers(prev => prev.filter(id => id !== event.data.userId))
          break
      }
    })
  }, [events, documentId])

  return {
    documentStatus,
    activeUsers,
    documentEvents: events.filter(event => event.data.documentId === documentId)
  }
}
