import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { Notification, ConnectionInfo } from '../types';
import NotificationStats from './NotificationStats';
import NotificationFilters from './NotificationFilters';
import NotificationList from './NotificationList';
import ConnectionStatus from './ConnectionStatus';

interface User {
  id: string;
  username: string;
}

interface NotificationsPageProps {
  user: User | null;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);

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
  } = useNotifications(user);

  // Get detailed connection info
  useEffect(() => {
    const info = getConnectionInfo();
    setConnectionInfo(info);
  }, [isConnected, getConnectionInfo]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // If notification has task, redirect to calendar with task data
    if (notification.task) {
      navigate(`/calendar?openTask=${notification.task.id}&editMode=true`, {
        state: { task: notification.task }
      });
    } else if (notification.action && notification.action.type === 'navigate') {
      navigate(notification.action.url);
    }
  };

  const testConnection = () => {
    sendMessage({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
  };

  const readCount = notifications.length - unreadCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/calendar')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <span>←</span>
                <span>Quay lại</span>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                📬 Quản lý thông báo
              </h1>
            </div>
          </div>

          {/* Connection Status */}
          <ConnectionStatus
            isConnected={isConnected}
            connectionInfo={connectionInfo}
            onTestConnection={testConnection}
          />
        </div>

        {/* Stats */}
        <NotificationStats
          totalCount={notifications.length}
          unreadCount={unreadCount}
          readCount={readCount}
        />

        {/* Filters and Controls */}
        <NotificationFilters
          currentFilter={filter}
          totalCount={notifications.length}
          unreadCount={unreadCount}
          readCount={readCount}
          onFilterChange={setFilter}
          onRefresh={fetchStoredNotifications}
          onClearAll={clearNotifications}
        />

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <NotificationList
            notifications={notifications}
            filter={filter}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={markAsRead}
            onRemove={removeNotification}
          />
        </div>

        {/* Debug Info */}
        <div className="mt-8">
          <details className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <summary className="font-semibold text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
              🐛 Debug Information
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Connection Info:</h4>
                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto text-gray-700">
                  {JSON.stringify(connectionInfo, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Connection Status:</h4>
                <pre className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700">
                  {connectionStatus}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">User Info:</h4>
                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto text-gray-700">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Raw Notifications:</h4>
                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto text-gray-700 max-h-64">
                  {JSON.stringify(notifications, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;