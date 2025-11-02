import { Notification } from '../types';

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  addListener(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (notifications: Notification[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  addNotification(notification: Notification) {
    // Avoid duplicates
    if (!this.notifications.find(n => n.id === notification.id)) {
      this.notifications.unshift(notification);
      this.notifyListeners();
    }
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  async removeNotification(notificationId: string): Promise<boolean> {
    // Remove from local state immediately
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();

    // Also remove from backend if it's a stored notification
    try {
      const API_BASE_URL =  'https://task-agent-api.ngrok.dev';
      const savedToken = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
      });

      if (response.ok) {
        console.log('✅ Notification deleted from backend:', notificationId);
        return true;
      } else {
        console.error('❌ Failed to delete notification from backend:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting notification from backend:', error);
      return false;
    }
  }

  async clearAllNotifications(): Promise<boolean> {
    // Clear local state immediately
    this.notifications = [];
    this.notifyListeners();

    // Also clear from backend
    try {
      const API_BASE_URL =  'https://task-agent-api.ngrok.dev';
      const savedToken = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
      });

      if (response.ok) {
        console.log('✅ All notifications cleared from backend');
        return true;
      } else {
        console.error('❌ Failed to clear all notifications from backend:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error clearing all notifications from backend:', error);
      return false;
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  setNotifications(notifications: Notification[]) {
    this.notifications = notifications;
    this.notifyListeners();
  }
}