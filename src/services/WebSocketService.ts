/**
 * WebSocket Service
 * STOMP over SockJS client with JWT authentication
 * Aligned with HyFloAPI backend WebSocket configuration
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

import { Client, IMessage, IFrame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { NotificationDTO } from '@/types/notification.types';

type NotificationHandler = (notification: NotificationDTO) => void;
type CountHandler = (count: number) => void;
type StatusHandler = (status: { connected: boolean; error?: string }) => void;

/**
 * WebSocket Service for real-time notifications
 * Connects to backend /ws endpoint with JWT authentication
 * Subscribes to /user/queue/notifications and /user/queue/notifications/count
 */
class WebSocketService {
  private client: Client | null = null;
  private notifSub: StompSubscription | null = null;
  private countSub: StompSubscription | null = null;
  private notificationHandler: NotificationHandler | null = null;
  private countHandler: CountHandler | null = null;
  private statusHandler: StatusHandler | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimer: number | null = null;
  private intentionalDisconnect = false;

  /**
   * Get base API URL from environment
   * Matches axios configuration
   */
  private getBaseApiUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/iaas/api';
  }

  /**
   * Get WebSocket URL by converting HTTP to WS protocol
   * Backend endpoint: /ws (configured in WebSocketConfig.java)
   */
  private getWebSocketUrl(): string {
    const base = this.getBaseApiUrl();
    const httpToWs = base.replace(/^http/, 'ws');
    return `${httpToWs.replace(/\/$/, '')}/ws`;
  }

  /**
   * Get JWT access token from localStorage
   * Matches AuthContext token storage
   */
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Connect to WebSocket with JWT authentication
   * 
   * @param onNotification Callback for notification messages
   * @param onCount Callback for unread count updates
   * @param onStatus Callback for connection status changes
   */
  connect(
    onNotification: NotificationHandler,
    onCount: CountHandler,
    onStatus: StatusHandler
  ): void {
    this.notificationHandler = onNotification;
    this.countHandler = onCount;
    this.statusHandler = onStatus;
    this.intentionalDisconnect = false;

    const token = this.getToken();
    if (!token) {
      console.warn('[WS] No access token available, skipping WebSocket connection');
      this.statusHandler?.({ connected: false, error: 'No authentication token' });
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    console.log('[WS] Connecting to:', wsUrl);

    this.client = new Client({
      // Use SockJS as WebSocket factory (backend uses .withSockJS())
      webSocketFactory: () => new SockJS(wsUrl) as any,
      
      // Send JWT in STOMP CONNECT frame headers
      // Backend WebSocketAuthInterceptor validates this
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Debug logging in development
      debug: (msg: string) => {
        if (import.meta.env.VITE_ENV === 'development') {
          console.log('[STOMP]', msg);
        }
      },

      // Manual reconnection handling
      reconnectDelay: 0,
      
      // Heartbeat configuration (10 seconds)
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // Connection established
      onConnect: (frame: IFrame) => {
        console.log('[WS] ✅ Connected', frame);
        this.reconnectAttempts = 0;
        this.statusHandler?.({ connected: true });
        this.subscribe();
      },

      // STOMP-level errors
      onStompError: (frame: IFrame) => {
        console.error('[WS] ❌ STOMP error:', frame.headers['message'], frame.body);
        this.statusHandler?.({
          connected: false,
          error: frame.headers['message'] || 'STOMP error',
        });
      },

      // WebSocket closed
      onWebSocketClose: (event: CloseEvent) => {
        console.warn('[WS] 🔌 Connection closed:', event.code, event.reason);
        this.statusHandler?.({ connected: false, error: 'Connection closed' });

        // Auto-reconnect if not intentionally disconnected
        if (!this.intentionalDisconnect) {
          this.scheduleReconnect();
        }
      },

      // WebSocket-level errors
      onWebSocketError: (event: Event) => {
        console.error('[WS] ❌ WebSocket error:', event);
        this.statusHandler?.({ connected: false, error: 'WebSocket error' });
      },
    });

    // Start connection
    this.client.activate();
  }

  /**
   * Subscribe to notification destinations
   * Backend sends to:
   * - /user/{username}/queue/notifications (NotificationDTO)
   * - /user/{username}/queue/notifications/count (Long)
   */
  private subscribe(): void {
    if (!this.client || !this.client.connected) {
      console.warn('[WS] ⚠️ Cannot subscribe - client not connected');
      return;
    }

    // Subscribe to notification messages
    // Backend: messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notification)
    this.notifSub = this.client.subscribe('/user/queue/notifications', (msg: IMessage) => {
      try {
        const notification: NotificationDTO = JSON.parse(msg.body);
        console.log('[WS] 📨 Received notification:', notification.title);
        this.notificationHandler?.(notification);
      } catch (e) {
        console.error('[WS] ❌ Failed to parse notification:', e, msg.body);
      }
    });

    // Subscribe to unread count updates
    // Backend: messagingTemplate.convertAndSendToUser(username, "/queue/notifications/count", unreadCount)
    this.countSub = this.client.subscribe('/user/queue/notifications/count', (msg: IMessage) => {
      try {
        const count = typeof msg.body === 'string' ? Number(msg.body) : 0;
        console.log('[WS] 🔢 Unread count:', count);
        this.countHandler?.(Number.isFinite(count) ? count : 0);
      } catch (e) {
        console.error('[WS] ❌ Failed to parse unread count:', e, msg.body);
      }
    });

    console.log('[WS] ✅ Subscribed to notification channels');
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[WS] ❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.statusHandler?.({
        connected: false,
        error: 'Max reconnection attempts reached',
      });
      return;
    }

    this.reconnectAttempts += 1;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, ..., max 30s
    const delay = Math.min(1000 * 2 ** (this.reconnectAttempts - 1), 30000);

    console.log(
      `[WS] 🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );
    
    this.statusHandler?.({
      connected: false,
      error: `Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    });

    this.reconnectTimer = window.setTimeout(() => {
      console.log('[WS] 🔄 Attempting reconnection...');
      if (this.notificationHandler && this.countHandler && this.statusHandler) {
        this.connect(this.notificationHandler, this.countHandler, this.statusHandler);
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    console.log('[WS] 🔌 Disconnecting...');
    this.intentionalDisconnect = true;

    // Clear reconnection timer
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Unsubscribe from all channels
    if (this.notifSub) {
      this.notifSub.unsubscribe();
      this.notifSub = null;
    }
    if (this.countSub) {
      this.countSub.unsubscribe();
      this.countSub = null;
    }

    // Deactivate STOMP client
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.statusHandler?.({ connected: false });
    console.log('[WS] ✅ Disconnected');
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
