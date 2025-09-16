/**
 * React Hook for WebSocket notifications
 * Manages WebSocket connection and provides notification state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = (user) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [error, setError] = useState(null);
  
  // Keep track of handlers to avoid memory leaks
  const handlersRef = useRef([]);

  // Connect to WebSocket when user is available
  useEffect(() => {
    if (user && user.id) {
      console.log('🔌 Connecting WebSocket for user:', user.username);
      setError(null);
      
      try {
        websocketService.connect(user.id);
        
        // Connection state handler
        const connectionHandler = websocketService.onConnectionChange((event) => {
          setIsConnected(event.type === 'connected');
          setConnectionStatus(event.type);
          
          if (event.type === 'connected') {
            setError(null);
            // Request pending tasks and fetch stored notifications when connected
            setTimeout(() => {
              websocketService.requestPendingTasks();
              fetchStoredNotifications();
            }, 1000);
          } else if (event.type === 'disconnected') {
            setError('Connection lost');
          }
        });
        
        handlersRef.current.push(connectionHandler);
        
      } catch (err) {
        console.error('🔌 Failed to connect WebSocket:', err);
        setError(err.message);
      }
    }

    // Cleanup on unmount or user change  
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      websocketService.disconnect();
    };
  }, [user]);

  // Handle task notifications
  useEffect(() => {
    const handleTaskNotification = (event) => {
      const notification = event.detail;
      console.log('📋 Task notification received in hook:', notification);
      
      // Create unique ID based on task and timestamp
      const uniqueId = `${notification.task?.id || 'notask'}-${notification.timestamp || Date.now()}`;
      
      // Check for duplicates
      setNotifications(prev => {
        const exists = prev.some(n => 
          n.uniqueId === uniqueId || 
          (n.task?.id === notification.task?.id && 
           Math.abs(new Date(n.receivedAt).getTime() - Date.now()) < 5000) // Within 5 seconds
        );
        
        if (exists) {
          console.log('📋 Duplicate notification detected, skipping:', uniqueId);
          return prev;
        }
        
        // Add new notification
        return [
          {
            id: Date.now() + Math.random(), // Display ID
            uniqueId: uniqueId, // Deduplication ID
            ...notification,
            isRead: false,
            receivedAt: new Date().toISOString()
          },
          ...prev
        ];
      });
    };

    const handlePendingTasks = (event) => {
      const tasks = event.detail;
      console.log('📋 Pending tasks received in hook:', tasks);
      setPendingTasks(tasks.tasks || []);
    };

    // Add event listeners
    window.addEventListener('taskNotification', handleTaskNotification);
    window.addEventListener('pendingTasks', handlePendingTasks);

    // Cleanup
    return () => {
      window.removeEventListener('taskNotification', handleTaskNotification);
      window.removeEventListener('pendingTasks', handlePendingTasks);
    };
  }, []);

  // Cleanup handlers on unmount
  useEffect(() => {
    return () => {
      handlersRef.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('🔌 Error unsubscribing handler:', error);
        }
      });
      handlersRef.current = [];
    };
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true }
          : n
      )
    );
    
    // Send to WebSocket server
    websocketService.markNotificationRead(notificationId);
    
    // If it's a stored notification, update via API
    if (notification && notification.isStored && notification.storedId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:8000/api/v1/notifications/${notification.storedId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to mark stored notification as read:', error);
      }
    }
  }, [notifications]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Send message to server
  const sendMessage = useCallback((message) => {
    websocketService.sendMessage(message);
  }, []);

  // Request fresh pending tasks
  const refreshPendingTasks = useCallback(() => {
    websocketService.requestPendingTasks();
  }, []);

  // Fetch stored notifications from API
  const fetchStoredNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched stored notifications:', data);
        
        // Convert stored notifications to the format expected by frontend
        const storedNotifications = data.notifications.map(notification => ({
          id: `stored-${notification.id}`,
          uniqueId: `stored-${notification.id}`,
          title: notification.title,
          body: notification.body,
          task: notification.data?.task,
          action: notification.action,
          type: notification.type,
          timestamp: notification.created_at,
          receivedAt: notification.created_at,
          isRead: notification.status === 'read',
          isStored: true,
          storedId: notification.id
        }));
        
        // Merge with existing notifications (avoid duplicates)
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.storedId).filter(Boolean));
          const newNotifications = storedNotifications.filter(n => !existingIds.has(n.storedId));
          return [...newNotifications, ...prev];
        });
      }
    } catch (error) {
      console.error('Failed to fetch stored notifications:', error);
    }
  }, [user]);

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get connection status info
  const getConnectionInfo = useCallback(() => {
    return websocketService.getStatus();
  }, []);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    error,
    
    // Notifications
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    removeNotification,
    
    // Tasks
    pendingTasks,
    refreshPendingTasks,
    
    // Actions
    sendMessage,
    getConnectionInfo,
    fetchStoredNotifications
  };
};