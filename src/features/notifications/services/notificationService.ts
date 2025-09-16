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

  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.notifyListeners();
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