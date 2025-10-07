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
  const [toastMessages, setToastMessages] = useState<Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    timestamp: string;
  }>>([]);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    type: 'danger' | 'warning' | 'info';
  } | null>(null);

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

  // Toast function
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const toastId = Date.now();
    const toast = {
      id: toastId,
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setToastMessages(prev => [...prev, toast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToastMessages(prev => prev.filter(t => t.id !== toastId));
    }, 3000);
  };

  // Confirm dialog function
  const showConfirmDialog = (
    title: string,
    message: string, 
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning'
  ) => {
    setConfirmDialog({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      },
      onCancel: () => {
        setConfirmDialog(null);
      },
      type
    });
  };

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

  // Enhanced handlers with custom popup and toast feedback
  const handleRemoveNotification = async (notificationId: string) => {
    showConfirmDialog(
      'Xóa thông báo',
      'Bạn có chắc chắn muốn xóa thông báo này không? Hành động này không thể hoàn tác.',
      async () => {
        try {
          await removeNotification(notificationId);
          showToast('✅ Đã xóa thông báo thành công', 'success');
        } catch (error) {
          console.error('Error removing notification:', error);
          showToast('❌ Có lỗi khi xóa thông báo', 'error');
        }
      },
      'danger'
    );
  };

  const handleClearAllNotifications = async () => {
    if (notifications.length === 0) {
      showToast('📭 Không có thông báo nào để xóa', 'info');
      return;
    }

    showConfirmDialog(
      'Xóa tất cả thông báo',
      `Bạn có chắc chắn muốn xóa tất cả ${notifications.length} thông báo không? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          await clearNotifications();
          showToast('✅ Đã xóa tất cả thông báo thành công', 'success');
        } catch (error) {
          console.error('Error clearing notifications:', error);
          showToast('❌ Có lỗi khi xóa tất cả thông báo', 'error');
        }
      },
      'danger'
    );
  };

  const readCount = notifications.length - unreadCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Toast Messages */}
      <div className="fixed top-20 right-6 z-50 space-y-2">
        {toastMessages.map((toast, index) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm text-white font-medium text-sm min-w-[300px] max-w-[400px] transform transition-all duration-300 ease-out animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-500/90 border-l-4 border-green-400' :
              toast.type === 'error' ? 'bg-red-500/90 border-l-4 border-red-400' :
              toast.type === 'warning' ? 'bg-yellow-500/90 border-l-4 border-yellow-400' :
              'bg-blue-500/90 border-l-4 border-blue-400'
            }`}
            style={{ 
              animationDelay: `${index * 0.1}s`
            }}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToastMessages(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white/70 hover:text-white text-lg font-bold w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmDialog.type === 'danger' ? 'bg-red-100' :
                  confirmDialog.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <span className="text-2xl">
                    {confirmDialog.type === 'danger' ? '🗑️' :
                     confirmDialog.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmDialog.title}
                  </h3>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {confirmDialog.message}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={confirmDialog.onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                    confirmDialog.type === 'danger' ? 'bg-red-500 hover:bg-red-600' :
                    confirmDialog.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                    'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {confirmDialog.type === 'danger' ? 'Xóa' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          onClearAll={handleClearAllNotifications}
        />

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <NotificationList
            notifications={notifications}
            filter={filter}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={markAsRead}
            onRemove={handleRemoveNotification}
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