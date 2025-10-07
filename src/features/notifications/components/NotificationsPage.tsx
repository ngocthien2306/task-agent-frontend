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