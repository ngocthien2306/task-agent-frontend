import { useState, useEffect, useCallback } from 'react';
import { Notification, WebSocketHookReturn, ConnectionInfo } from '../types';
import { NotificationService } from '../services/notificationService';
import { WebSocketService } from '../services/webSocketService';

interface User {
  id: string;
  username: string;
}

export const useNotifications = (user: User | null): WebSocketHookReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const notificationService = NotificationService.getInstance();
  const webSocketService = WebSocketService.getInstance();

  // Update local state when notifications change
  useEffect(() => {
    const handleNotificationsUpdate = (updatedNotifications: Notification[]) => {
      setNotifications(updatedNotifications);
    };

    notificationService.addListener(handleNotificationsUpdate);
    
    // Initialize with current notifications
    setNotifications(notificationService.getNotifications());

    return () => {
      notificationService.removeListener(handleNotificationsUpdate);
    };
  }, []);

  // Handle WebSocket connection
  useEffect(() => {
    if (user?.id) {
      const handleConnectionChange = (connected: boolean) => {
        setIsConnected(connected);
      };

      webSocketService.addConnectionListener(handleConnectionChange);
      webSocketService.connect(user.id);

      // Fetch stored notifications on mount
      fetchStoredNotifications();

      return () => {
        webSocketService.removeConnectionListener(handleConnectionChange);
      };
    } else {
      webSocketService.disconnect();
      setIsConnected(false);
    }
  }, [user?.id]);

  const fetchStoredNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
      const savedToken = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        const storedNotifications: Notification[] = data.notifications.map((notif: any) => ({
          id: notif.id,
          title: notif.title,
          body: notif.body,
          type: notif.type,
          timestamp: notif.created_at,
          receivedAt: notif.created_at,
          isRead: notif.is_read,
          task: notif.data?.task,
          action: notif.action
        }));

        notificationService.setNotifications(storedNotifications);
      }
    } catch (error) {
      console.error('❌ Error fetching stored notifications:', error);
    }
  }, [user]);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    notificationService.removeNotification(notificationId);
  }, []);

  const clearNotifications = useCallback(() => {
    notificationService.clearAllNotifications();
  }, []);

  const sendMessage = useCallback((message: any) => {
    webSocketService.sendMessage(message);
  }, []);

  const getConnectionInfo = useCallback((): ConnectionInfo | null => {
    return webSocketService.getConnectionInfo();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const connectionStatus = webSocketService.getConnectionStatus();

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    removeNotification,
    isConnected,
    connectionStatus,
    sendMessage,
    getConnectionInfo,
    fetchStoredNotifications
  };
};