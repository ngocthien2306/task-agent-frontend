/**
 * Notifications Management Page
 * Display and manage all notifications
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
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

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-title">
          <button 
            onClick={() => navigate('/calendar')}
            className="back-button"
          >
            ← Quay lại
          </button>
          <h1>Quản lý thông báo</h1>
        </div>

        {/* Connection Status */}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>
              {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
              {connectionInfo && ` (${connectionInfo.readyState})`}
            </span>
          </div>
          <button onClick={testConnection} className="test-button">
            Test kết nối
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="notifications-stats">
        <div className="stat-card">
          <div className="stat-number">{notifications.length}</div>
          <div className="stat-label">Tổng thông báo</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{unreadCount}</div>
          <div className="stat-label">Chưa đọc</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{notifications.length - unreadCount}</div>
          <div className="stat-label">Đã đọc</div>
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
  );
};

export default NotificationsPage;