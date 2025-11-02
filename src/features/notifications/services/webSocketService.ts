import { Notification } from '../types';
import { NotificationService } from './notificationService';

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval: number | null = null;
  private notificationService: NotificationService;
  private connectionListeners: ((connected: boolean) => void)[] = [];

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  addConnectionListener(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener);
  }

  removeConnectionListener(listener: (connected: boolean) => void) {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  private notifyConnectionListeners() {
    this.connectionListeners.forEach(listener => listener(this.isConnected));
  }

  connect(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    const API_BASE_URL = 'https://task-agent-api.ngrok.dev';
    const wsUrl = API_BASE_URL.replace('http', 'ws') + `/api/v1/ws/notifications/${userId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);

          if (data.type === 'task_notification' && data.stored) {
            const notification: Notification = {
              id: data.id || Date.now().toString(),
              title: data.title,
              body: data.body,
              type: data.type,
              timestamp: data.timestamp,
              receivedAt: new Date().toISOString(),
              isRead: false,
              task: data.task,
              action: data.action,
              toast: data.toast,  // Include toast details from backend
              data: data.data     // Include full data object
            };

            this.notificationService.addNotification(notification);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.notifyConnectionListeners();
        this.scheduleReconnect(userId);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnected = false;
        this.notifyConnectionListeners();
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }

  private scheduleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectInterval = window.setTimeout(() => {
        this.connect(userId);
      }, delay);
    }
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.notifyConnectionListeners();
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  getConnectionStatus(): string {
    if (!this.ws) return 'Disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'Connecting';
      case WebSocket.OPEN: return 'Connected';
      case WebSocket.CLOSING: return 'Closing';
      case WebSocket.CLOSED: return 'Closed';
      default: return 'Unknown';
    }
  }

  getConnectionInfo() {
    return {
      readyState: this.getConnectionStatus(),
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}