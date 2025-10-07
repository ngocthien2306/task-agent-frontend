/**
 * Notification Toast Component
 * Displays real-time notifications in corner of screen
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
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
  const [toastMessages, setToastMessages] = useState([]);

  // Show only recent notifications as toasts
  useEffect(() => {
    console.log('🔔 NotificationToast: notifications changed', notifications);
    
    // Show last 3 unread notifications
    const recentNotifications = notifications
      .filter(n => !n.isRead)
      .slice(0, 3);
    
    console.log('🔔 NotificationToast: recent unread notifications', recentNotifications);
    setVisibleNotifications(recentNotifications);

    // Auto-hide notifications after 10 seconds (only hide from UI, don't delete from database)
    recentNotifications.forEach(notification => {
      setTimeout(() => {
        console.log('🔔 NotificationToast: auto-hiding notification', notification.id);
        hideNotification(notification.id); // Just hide from UI
      }, 10000);
    });
  }, [notifications, markAsRead]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Handle action if available
    if (notification.action && notification.action.type === 'navigate') {
      window.location.href = notification.action.url;
    }
  };

  // Show toast message
  const showToast = (message, type = 'info') => {
    const toastId = Date.now();
    const toast = {
      id: toastId,
      message,
      type, // 'success', 'error', 'info', 'warning'
      timestamp: new Date().toISOString()
    };
    
    setToastMessages(prev => [...prev, toast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToastMessages(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  // Hide notification from UI only (don't delete from database)
  const hideNotification = (notificationId) => {
    markAsRead(notificationId); // Mark as read but keep in database
  };

  const handleDismiss = (notification, event) => {
    event.stopPropagation();
    hideNotification(notification.id); // Just hide, don't delete
  };

  const handleDisableReminder = async (notification, event) => {
    event.stopPropagation();
    
    try {
      // Get reminder ID from toast data first, then fallback to notification data
      const reminderId = notification.toast?.reminder?.reminder_id || 
                         notification.data?.extra?.reminder_id;
      if (!reminderId) {
        console.error('No reminder ID found in notification');
        return;
      }

      // Call API to disable socket notifications for this reminder
      const token = localStorage.getItem('token');
      const pythonApiUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
      const response = await fetch(`${pythonApiUrl}/api/v1/reminders/${reminderId}/disable-socket`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Socket notifications disabled for reminder:', reminderId);
        // Hide the current notification from UI
        hideNotification(notification.id);
        // Show success toast
        showToast('✅ Đã tắt thông báo nhắc nhở cho task này', 'success');
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Failed to disable reminder:', error);
      showToast('❌ Có lỗi khi tắt thông báo. Vui lòng thử lại.', 'error');
    }
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

      {/* Toast Messages */}
      <div className="toast-container">
        {toastMessages.map((toast, index) => (
          <div
            key={toast.id}
            className={`toast-message toast-${toast.type}`}
            style={{ 
              top: `${80 + (index * 60)}px`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            <span className="toast-content">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToastMessages(prev => prev.filter(t => t.id !== toast.id))}
            >
              ×
            </button>
          </div>
        ))}
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
                  {notification.toast?.formatted_time || formatTime(notification.timestamp)}
                </span>
              </div>
              
              <div className="notification-body">
                {notification.body}
              </div>

              {/* Enhanced Task details with toast information */}
              {(notification.task || notification.toast?.task) && (
                <div className="notification-task">
                  {/* Use toast task info if available, fallback to notification.task */}
                  {(() => {
                    const taskInfo = notification.toast?.task || notification.task;
                    return (
                      <>
                        <div className="task-info-row">
                          <div className="task-priority">
                            <span className={`priority-badge priority-${taskInfo.priority}`}>
                              {taskInfo.priority === 'high' ? '🔴 Cao' : 
                               taskInfo.priority === 'medium' ? '🟡 Trung bình' : '🟢 Thấp'}
                            </span>
                          </div>
                          
                          {taskInfo.category && (
                            <div className="task-category">
                              📂 {taskInfo.category}
                            </div>
                          )}
                        </div>
                        
                        {taskInfo.due_date && (
                          <div className="task-due">
                            📅 {notification.toast?.formatted_date || 
                                 new Date(taskInfo.due_date).toLocaleDateString('vi-VN')}
                            {taskInfo.due_time && ` ⏰ ${taskInfo.due_time}`}
                          </div>
                        )}

                        {/* Reminder details if available */}
                        {notification.toast?.reminder && (
                          <div className="reminder-details">
                            {notification.toast.reminder.before_due && (
                              <div className="reminder-timing">
                                ⏱️ Nhắc trước: {notification.toast.reminder.before_due}
                              </div>
                            )}
                            {notification.toast.reminder.reminder_message && (
                              <div className="reminder-message">
                                💬 "{notification.toast.reminder.reminder_message}"
                              </div>
                            )}
                          </div>
                        )}

                        {/* Task status */}
                        <div className="task-status">
                          <span className={`status-badge status-${taskInfo.status}`}>
                            {taskInfo.status === 'pending' ? '⏳ Đang chờ' :
                             taskInfo.status === 'in_progress' ? '🔄 Đang làm' :
                             taskInfo.status === 'completed' ? '✅ Hoàn thành' : '❌ Đã hủy'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Action buttons */}
              <div className="notification-actions">
                <button className="action-button primary">
                  Xem chi tiết
                </button>
                
                {/* Show "Don't remind again" button for task reminders with reminder ID */}
                {(notification.data?.extra?.notification_type === 'task_reminder' || 
                  notification.toast?.reminder?.reminder_id) && (
                  <button 
                    className="action-button secondary"
                    onClick={(e) => handleDisableReminder(notification, e)}
                  >
                    Không nhắc nữa
                  </button>
                )}
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