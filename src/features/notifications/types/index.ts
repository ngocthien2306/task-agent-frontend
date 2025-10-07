export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  due_time?: string;
  category?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationAction {
  type: 'navigate';
  url: string;
}

export interface ToastDetails {
  show_details: boolean;
  task?: Task;
  reminder?: {
    before_due?: string;
    reminder_message?: string;
    reminder_id?: string;
  };
  timestamp?: string;
  formatted_time?: string;
  formatted_date?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  timestamp: string;
  receivedAt: string;
  isRead: boolean;
  task?: Task;
  action?: NotificationAction;
  toast?: ToastDetails;
  data?: any;
}

export interface ConnectionInfo {
  readyState: string;
  [key: string]: any;
}

export interface WebSocketHookReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
  isConnected: boolean;
  connectionStatus: string;
  sendMessage: (message: any) => void;
  getConnectionInfo: () => ConnectionInfo | null;
  fetchStoredNotifications: () => void;
}