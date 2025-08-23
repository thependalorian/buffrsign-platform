import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  documentId?: string;
  workflowId?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  joinDocumentRoom: (documentId: string) => void;
  leaveDocumentRoom: (documentId: string) => void;
  joinWorkflowRoom: (workflowId: string) => void;
  leaveWorkflowRoom: (workflowId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Document event handlers
      newSocket.on('document:updated', (data) => {
        console.log('Document updated:', data);
        addNotification({
          type: 'info',
          title: 'Document Updated',
          message: `Document "${data.document.title}" has been updated`,
          documentId: data.document.id
        });
      });

      newSocket.on('document:signed', (data) => {
        console.log('Document signed:', data);
        addNotification({
          type: 'success',
          title: 'Document Signed',
          message: `${data.party.name} has signed "${data.document.title}"`,
          documentId: data.document.id
        });
        toast.success(`Document signed by ${data.party.name}`);
      });

      newSocket.on('document:rejected', (data) => {
        console.log('Document rejected:', data);
        addNotification({
          type: 'warning',
          title: 'Document Rejected',
          message: `${data.party.name} has rejected "${data.document.title}"`,
          documentId: data.document.id
        });
        toast.error(`Document rejected by ${data.party.name}`);
      });

      // Workflow event handlers
      newSocket.on('workflow:started', (data) => {
        console.log('Workflow started:', data);
        addNotification({
          type: 'info',
          title: 'Workflow Started',
          message: `Signing workflow started for "${data.document.title}"`,
          workflowId: data.workflow.id,
          documentId: data.document.id
        });
      });

      newSocket.on('workflow:completed', (data) => {
        console.log('Workflow completed:', data);
        addNotification({
          type: 'success',
          title: 'Workflow Completed',
          message: `All parties have signed "${data.document.title}"`,
          workflowId: data.workflow.id,
          documentId: data.document.id
        });
        toast.success(`Workflow completed for "${data.document.title}"`);
      });

      newSocket.on('workflow:reminder', (data) => {
        console.log('Workflow reminder:', data);
        addNotification({
          type: 'info',
          title: 'Signing Reminder',
          message: `Reminder sent to ${data.party.name} for "${data.document.title}"`,
          workflowId: data.workflow.id,
          documentId: data.document.id
        });
      });

      // AI event handlers
      newSocket.on('ai:analysis_complete', (data) => {
        console.log('AI analysis complete:', data);
        addNotification({
          type: 'info',
          title: 'AI Analysis Complete',
          message: `Document analysis completed for "${data.document.title}"`,
          documentId: data.document.id
        });
      });

      newSocket.on('ai:workflow_optimized', (data) => {
        console.log('AI workflow optimized:', data);
        addNotification({
          type: 'info',
          title: 'Workflow Optimized',
          message: `AI has optimized the signing workflow for "${data.document.title}"`,
          documentId: data.document.id
        });
      });

      // Compliance event handlers
      newSocket.on('compliance:check_failed', (data) => {
        console.log('Compliance check failed:', data);
        addNotification({
          type: 'error',
          title: 'Compliance Issue',
          message: `Compliance check failed for "${data.document.title}": ${data.reason}`,
          documentId: data.document.id
        });
        toast.error('Compliance check failed');
      });

      // System notifications
      newSocket.on('system:notification', (data) => {
        console.log('System notification:', data);
        addNotification({
          type: data.type || 'info',
          title: data.title,
          message: data.message
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user, token]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after 30 seconds for info/success types
    if (notification.type === 'info' || notification.type === 'success') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 30000);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const joinDocumentRoom = (documentId: string) => {
    if (socket) {
      socket.emit('join:document', { documentId });
      console.log('Joined document room:', documentId);
    }
  };

  const leaveDocumentRoom = (documentId: string) => {
    if (socket) {
      socket.emit('leave:document', { documentId });
      console.log('Left document room:', documentId);
    }
  };

  const joinWorkflowRoom = (workflowId: string) => {
    if (socket) {
      socket.emit('join:workflow', { workflowId });
      console.log('Joined workflow room:', workflowId);
    }
  };

  const leaveWorkflowRoom = (workflowId: string) => {
    if (socket) {
      socket.emit('leave:workflow', { workflowId });
      console.log('Left workflow room:', workflowId);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    joinDocumentRoom,
    leaveDocumentRoom,
    joinWorkflowRoom,
    leaveWorkflowRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};