import React from 'react';
import { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
  onMarkAsRead,
  onRemove
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityClasses = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-sky-300 transform hover:-translate-y-1 ${
        !notification.isRead 
          ? 'border-sky-200 shadow-md bg-gradient-to-r from-white to-sky-50' 
          : 'border-gray-200 shadow-sm'
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-3 left-3 w-3 h-3 bg-sky-500 rounded-full animate-pulse"></div>
      )}

      {/* Main content */}
      <div className="ml-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-sky-900 leading-tight">
            {notification.title}
          </h3>
          <span className="text-sm text-gray-500 ml-4 flex-shrink-0">
            {formatTime(notification.timestamp)}
          </span>
        </div>

        {/* Body */}
        <div className="text-gray-700 mb-4 leading-relaxed">
          {notification.body}
        </div>

        {/* Task details */}
        {notification.task && (
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 mb-4 border border-sky-100">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityClasses(notification.task.priority)}`}>
                🎯 {getPriorityText(notification.task.priority)}
              </span>
              
              {notification.task.due_date && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  📅 {new Date(notification.task.due_date).toLocaleDateString('vi-VN')}
                  {notification.task.due_time && ` ${notification.task.due_time}`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sky-700">🆔 ID:</span>
                <span className="font-mono">{notification.task.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-sky-700">📊 Status:</span>
                <span>{notification.task.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <span className="font-medium">🏷️ Type:</span>
            {notification.type}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">📨 Received:</span>
            {formatTime(notification.receivedAt)}
          </span>
          {notification.action && (
            <span className="flex items-center gap-1">
              <span className="font-medium">🔗 Action:</span>
              {notification.action.url}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!notification.isRead && (
            <button
              className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
            >
              ✓ Đánh dấu đã đọc
            </button>
          )}
          
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;