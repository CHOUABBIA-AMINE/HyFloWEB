/**
 * Notification Context
 * Manages WebSocket connection, notifications list, and unread count
 * Only connects for authenticated VALIDATOR users
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { webSocketService } from '@/services/WebSocketService';
import type { NotificationDTO, WebSocketStatus } from '@/types/notification.types';

/**
 * Notification context value
 */
interface NotificationContextType {
  notifications: NotificationDTO[];
  unreadCount: number;
  wsStatus: WebSocketStatus;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Hook to access notification context
 * Must be used within NotificationProvider
 */
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
}

/**
 * Notification Provider Component
 * Wraps application to provide real-time notification functionality
 * Automatically connects/disconnects WebSocket based on auth state
 */
export const NotificationProvider = ({ children }: Props) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>({
    connected: false,
    reconnecting: false,
    error: null,
  });

  /**
   * Check if current user has VALIDATOR role
   * Backend sends notifications only to VALIDATOR users
   */
  const isValidator = useCallback(() => {
    const roles = user?.roles || [];
    return roles.includes('ROLE_VALIDATOR') || roles.includes('VALIDATOR');
  }, [user]);

  /**
   * Handle incoming notification from WebSocket
   * Adds to list and increments unread count
   */
  const handleNotification = useCallback((notif: NotificationDTO) => {
    console.log('[NotificationContext] Received notification:', notif.title);
    
    // Add to beginning of list (newest first)
    setNotifications(prev => [notif, ...prev]);
    
    // Increment unread count if notification is unread
    if (!notif.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Optional: Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title, {
        body: notif.message,
        icon: '/favicon.ico',
        tag: String(notif.id),
      });
    }
  }, []);

  /**
   * Handle unread count update from WebSocket
   * Backend can send count separately via /user/queue/notifications/count
   */
  const handleCount = useCallback((count: number) => {
    console.log('[NotificationContext] Unread count update:', count);
    setUnreadCount(count);
  }, []);

  /**
   * Handle WebSocket connection status changes
   */
  const handleStatus = useCallback(
    ({ connected, error }: { connected: boolean; error?: string }) => {
      setWsStatus({
        connected,
        reconnecting: !connected && !!error && error.startsWith('Reconnecting'),
        error: error || null,
      });
      
      console.log(
        `[NotificationContext] WebSocket status: ${connected ? 'Connected' : 'Disconnected'}`,
        error ? `(${error})` : ''
      );
    },
    []
  );

  /**
   * Connect/disconnect WebSocket based on authentication and role
   */
  useEffect(() => {
    if (isAuthenticated && isValidator()) {
      console.log('[NotificationContext] Connecting WebSocket for VALIDATOR user');
      webSocketService.connect(handleNotification, handleCount, handleStatus);

      // Request browser notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('[NotificationContext] Notification permission:', permission);
        });
      }

      return () => {
        console.log('[NotificationContext] Disconnecting WebSocket');
        webSocketService.disconnect();
      };
    } else {
      // Ensure disconnection when user logs out or is not VALIDATOR
      console.log('[NotificationContext] User not authenticated or not VALIDATOR, disconnecting');
      webSocketService.disconnect();
      
      // Clear notifications and count
      setNotifications([]);
      setUnreadCount(0);
      setWsStatus({ connected: false, reconnecting: false, error: null });
    }
  }, [isAuthenticated, isValidator, handleNotification, handleCount, handleStatus]);

  /**
   * Mark a single notification as read
   * Updates local state and decrements unread count
   * 
   * @param id Notification ID
   */
  const markAsRead = useCallback((id: string | number) => {
    setNotifications(prev =>
      prev.map(n => {
        if (String(n.id) === String(id) && !n.isRead) {
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      })
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // TODO: Call backend API to persist read status
    // Example: notificationService.markAsRead(id)
    console.log('[NotificationContext] Marked notification as read:', id);
  }, []);

  /**
   * Mark all notifications as read
   * Updates local state and resets unread count
   */
  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: n.readAt || now }))
    );
    
    setUnreadCount(0);
    
    // TODO: Call backend API to persist read status for all
    // Example: notificationService.markAllAsRead()
    console.log('[NotificationContext] Marked all notifications as read');
  }, []);

  /**
   * Clear all notifications from local state
   * Does not affect backend persistence
   */
  const clear = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    console.log('[NotificationContext] Cleared all notifications');
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    wsStatus,
    markAsRead,
    markAllAsRead,
    clear,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
