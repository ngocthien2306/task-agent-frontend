/**
 * Notifications Management Page
 * Display and manage all notifications
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import './NotificationsPage.css';

const NotificationsPage = ({ user }) => {
  const navigate = useNavigate();
  const { 
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
  } = useWebSocket(user);

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [connectionInfo, setConnectionInfo] = useState(null);

  // Get detailed connection info
  useEffect(() => {
    const info = getConnectionInfo();
    setConnectionInfo(info);
  }, [isConnected, getConnectionInfo]);

  // Filter notifications
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

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // If notification has task, redirect to calendar with task data
    if (notification.task) {
      // Navigate to calendar with task data as URL params
      navigate(`/calendar?openTask=${notification.task.id}&editMode=true`, {
        state: { task: notification.task }
      });
    } else if (notification.action && notification.action.type === 'navigate') {
      // Fallback to navigation
      navigate(notification.action.url);
    }
  };


  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const testConnection = () => {
    sendMessage({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
  };

  const handleDisableReminder = async (notification, event) => {
    event.stopPropagation();
    
    try {
      // Get reminder ID from notification data
      const reminderId = notification.data?.extra?.reminder_id;
      if (!reminderId) {
        console.error('No reminder ID found in notification');
        alert('Không tìm thấy ID nhắc nhở trong thông báo');
        return;
      }

      // Call API to disable socket notifications for this reminder
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/reminders/${reminderId}/disable-socket`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Socket notifications disabled for reminder:', reminderId);
        // Remove the current notification
        removeNotification(notification.id);
        // Show success message
        alert('Đã tắt thông báo nhắc nhở cho task này');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to disable reminder:', error);
      alert(`Có lỗi khi tắt thông báo: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-white/50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Về trang chính
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <nav className="hidden sm:flex space-x-6">
                <button
                  onClick={() => navigate('/calendar')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Calendar
                </button> 
                <button
                  onClick={() => navigate('/subscription')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Subscription
                </button>
                <button
                  onClick={() => navigate('/animation-studio')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Animation Studio
                </button>
              </nav>
            </div>

            {/* Center - Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Thông báo
              </h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>
                  {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                </span>
              </div>
              <button 
                onClick={testConnection} 
                className="inline-flex items-center p-2 text-gray-500 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-colors"
                title="Test kết nối"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{notifications.length}</div>
              <div className="text-sm font-medium text-gray-600">Tổng thông báo</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{unreadCount}</div>
              <div className="text-sm font-medium text-gray-600">Chưa đọc</div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{notifications.length - unreadCount}</div>
              <div className="text-sm font-medium text-gray-600">Đã đọc</div>
            </div>
          </div>
        </div>

      {/* Controls */}
      <div className="notifications-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Đã đọc ({notifications.length - unreadCount})
          </button>
        </div>

        <div className="action-buttons">
          <button 
            onClick={fetchStoredNotifications}
            className="refresh-button"
          >
            🔄 Làm mới
          </button>
          <button 
            onClick={clearNotifications}
            className="clear-button"
            disabled={notifications.length === 0}
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">
              {filter === 'all' ? 'Không có thông báo nào' : 
               filter === 'unread' ? 'Không có thông báo chưa đọc' : 
               'Không có thông báo đã đọc'}
            </div>
            <div className="empty-subtitle">
              Thông báo sẽ xuất hiện ở đây khi có task mới hoặc nhắc nhở
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Unread indicator */}
              {!notification.isRead && <div className="unread-indicator"></div>}

              {/* Main content */}
              <div className="notification-main">
                <div className="notification-header">
                  <h3 className="notification-title">{notification.title}</h3>
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
                    <div className="task-header">
                      <span className={`priority-badge ${getPriorityClass(notification.task.priority)}`}>
                        {notification.task.priority === 'high' ? 'Cao' : 
                         notification.task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                      
                      {notification.task.due_date && (
                        <span className="task-due">
                          📅 {new Date(notification.task.due_date).toLocaleDateString('vi-VN')}
                          {notification.task.due_time && ` ${notification.task.due_time}`}
                        </span>
                      )}
                    </div>

                    <div className="task-details">
                      <div className="task-id">ID: {notification.task.id}</div>
                      <div className="task-status">Status: {notification.task.status}</div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="notification-meta">
                  <span className="meta-item">Type: {notification.type}</span>
                  <span className="meta-item">Received: {formatTime(notification.receivedAt)}</span>
                  {notification.action && (
                    <span className="meta-item">Action: {notification.action.url}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="mark-read-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                
                {/* Show "Don't remind again" button for task reminders */}
                {notification.data?.extra?.notification_type === 'task_reminder' && (
                  <button
                    className="disable-reminder-button"
                    onClick={(e) => handleDisableReminder(notification, e)}
                  >
                    Không nhắc nữa
                  </button>
                )}
                
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Debug Info */}
      <div className="debug-info">
        <details>
          <summary>Debug Information</summary>
          <div className="debug-content">
            <h4>Connection Info:</h4>
            <pre>{JSON.stringify(connectionInfo, null, 2)}</pre>
            
            <h4>Connection Status:</h4>
            <pre>{connectionStatus}</pre>
            
            <h4>User Info:</h4>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            
            <h4>Raw Notifications:</h4>
            <pre>{JSON.stringify(notifications, null, 2)}</pre>
          </div>
        </details>
      </div>
      </div>
    </div>
  );
};

export default NotificationsPage;