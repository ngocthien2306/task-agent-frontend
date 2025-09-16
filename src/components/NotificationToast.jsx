/**
 * Notification Toast Component
 * Displays real-time notifications in corner of screen
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import './NotificationToast.css';

const NotificationToast = ({ user }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    removeNotification,
    isConnected,
    connectionStatus 
  } = useWebSocket(user);

  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Show only recent notifications as toasts
  useEffect(() => {
    console.log('🔔 NotificationToast: notifications changed', notifications);
    
    // Show last 3 unread notifications
    const recentNotifications = notifications
      .filter(n => !n.isRead)
      .slice(0, 3);
    
    console.log('🔔 NotificationToast: recent unread notifications', recentNotifications);
    setVisibleNotifications(recentNotifications);

    // Auto-hide notifications after 10 seconds
    recentNotifications.forEach(notification => {
      setTimeout(() => {
        console.log('🔔 NotificationToast: auto-removing notification', notification.id);
        removeNotification(notification.id);
      }, 10000);
    });
  }, [notifications, removeNotification]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Handle action if available
    if (notification.action && notification.action.type === 'navigate') {
      window.location.href = notification.action.url;
    }
  };

  const handleDismiss = (notification, event) => {
    event.stopPropagation();
    removeNotification(notification.id);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'notification-high';
      case 'medium': return 'notification-medium';
      case 'low': return 'notification-low';
      default: return 'notification-medium';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <>
      {/* Connection Status Indicator */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="connection-dot"></div>
        <span className="connection-text">
          {isConnected ? 'Kết nối' : 'Mất kết nối'}
        </span>
      </div>

      {/* Notification Counter */}
      {unreadCount > 0 && (
        <div className="notification-counter">
          <span className="counter-badge">{unreadCount}</span>
          <span className="counter-text">thông báo mới</span>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="notification-container">
        {visibleNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`notification-toast ${getPriorityClass(notification.task?.priority)} notification-enter`}
            style={{ 
              bottom: `${20 + (index * 120)}px`,
              animationDelay: `${index * 0.1}s`
            }}
            onClick={() => handleNotificationClick(notification)}
          >
            {/* Close button */}
            <button
              className="notification-close"
              onClick={(e) => handleDismiss(notification, e)}
              aria-label="Đóng thông báo"
            >
              ×
            </button>

            {/* Notification content */}
            <div className="notification-content">
              <div className="notification-header">
                <span className="notification-title">{notification.title}</span>
                <span className="notification-time">
                  {formatTime(notification.timestamp)}
                </span>
              </div>
              
              <div className="notification-body">
                {notification.body}
              </div>

              {/* Task details */}
              {notification.task && (
                <div className="notification-task">
                  <div className="task-priority">
                    <span className={`priority-badge priority-${notification.task.priority}`}>
                      {notification.task.priority === 'high' ? 'Cao' : 
                       notification.task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </div>
                  
                  {notification.task.due_date && (
                    <div className="task-due">
                      📅 {new Date(notification.task.due_date).toLocaleDateString('vi-VN')}
                      {notification.task.due_time && ` ${notification.task.due_time}`}
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="notification-actions">
                <button className="action-button primary">
                  Xem chi tiết
                </button>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <div className="notification-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationToast;