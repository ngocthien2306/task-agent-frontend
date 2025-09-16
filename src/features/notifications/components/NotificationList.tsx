import React from 'react';
import { Notification } from '../types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  filter: 'all' | 'unread' | 'read';
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  filter,
  onNotificationClick,
  onMarkAsRead,
  onRemove
}) => {
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="text-6xl mb-4">📭</div>
        <div className="text-xl font-semibold text-gray-800 mb-2">
          {filter === 'all' ? 'Không có thông báo nào' : 
           filter === 'unread' ? 'Không có thông báo chưa đọc' : 
           'Không có thông báo đã đọc'}
        </div>
        <div className="text-gray-600 max-w-md">
          Thông báo sẽ xuất hiện ở đây khi có task mới hoặc nhắc nhở
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onNotificationClick={onNotificationClick}
          onMarkAsRead={onMarkAsRead}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default NotificationList;