/**
 * WebSocket Service for Real-time Notifications
 * Handles bidirectional communication with backend
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.messageHandlers = new Map();
    this.connectionListeners = [];
  }

  /**
   * Connect to WebSocket server
   * @param {string} userId - User ID for the connection
   */
  connect(userId) {
    if (this.isConnected && this.userId === userId) {
      console.log('🔌 WebSocket already connected for user:', userId);
      return;
    }

    // Disconnect any existing connection first
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      console.log('🔌 Closing existing WebSocket connection');
      this.socket.close();
    }

    this.userId = userId;
    const wsUrl = `ws://localhost:8000/api/v1/ws/notifications/${userId}`;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('🔌 WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.onopen = (event) => {
      console.log('🔌 WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      
      // Notify connection listeners
      this.connectionListeners.forEach(listener => {
        try {
          listener({ type: 'connected', userId: this.userId });
        } catch (error) {
          console.error('🔌 Error in connection listener:', error);
        }
      });

      // Send ping to server
      this.sendMessage({ type: 'ping' });
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('🔌 WebSocket message received:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('🔌 Failed to parse WebSocket message:', error, event.data);
      }
    };

    this.socket.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:', event.code, event.reason);
      this.isConnected = false;
      
      // Notify connection listeners
      this.connectionListeners.forEach(listener => {
        try {
          listener({ type: 'disconnected', code: event.code, reason: event.reason });
        } catch (error) {
          console.error('🔌 Error in connection listener:', error);
        }
      });

      // Attempt to reconnect if not manually closed
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('🔌 WebSocket error:', error);
      this.isConnected = false;
    };
  }

  /**
   * Handle incoming WebSocket messages
   * @param {Object} message - Parsed message object
   */
  handleMessage(message) {
    const messageType = message.type;

    // Handle specific message types
    switch (messageType) {
      case 'connection_established':
        console.log('🔌 Connection established:', message.message);
        break;

      case 'pong':
        console.log('🔌 Pong received');
        break;

      case 'heartbeat':
        console.log('🔌 Heartbeat received');
        break;

      case 'task_notification':
        console.log('📋 Task notification received:', message);
        this.handleTaskNotification(message);
        break;

      case 'pending_tasks':
        console.log('📋 Pending tasks received:', message);
        this.handlePendingTasks(message);
        break;

      default:
        console.log('🔌 Unknown message type:', messageType, message);
    }

    // Call registered message handlers
    if (this.messageHandlers.has(messageType)) {
      const handlers = this.messageHandlers.get(messageType);
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`🔌 Error in ${messageType} handler:`, error);
        }
      });
    }

    // Call global message handlers
    if (this.messageHandlers.has('*')) {
      const handlers = this.messageHandlers.get('*');
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('🔌 Error in global message handler:', error);
        }
      });
    }
  }

  /**
   * Handle task notification messages
   * @param {Object} message - Task notification message
   */
  handleTaskNotification(message) {
    // Create a notification event that the UI can listen to
    const notificationEvent = new CustomEvent('taskNotification', {
      detail: {
        title: message.title,
        body: message.body,
        task: message.task,
        action: message.action,
        timestamp: message.timestamp,
        type: message.notification_type
      }
    });

    // Dispatch the event
    window.dispatchEvent(notificationEvent);
  }

  /**
   * Handle pending tasks messages
   * @param {Object} message - Pending tasks message
   */
  handlePendingTasks(message) {
    const tasksEvent = new CustomEvent('pendingTasks', {
      detail: {
        tasks: message.tasks,
        count: message.count,
        timestamp: message.timestamp
      }
    });

    window.dispatchEvent(tasksEvent);
  }

  /**
   * Send message to server
   * @param {Object} message - Message to send
   */
  sendMessage(message) {
    if (this.isConnected && this.socket) {
      try {
        this.socket.send(JSON.stringify(message));
        console.log('🔌 Message sent:', message);
      } catch (error) {
        console.error('🔌 Failed to send message:', error);
      }
    } else {
      console.warn('🔌 Cannot send message - WebSocket not connected');
    }
  }

  /**
   * Register message handler for specific message types
   * @param {string} messageType - Type of message to handle (* for all)
   * @param {Function} handler - Handler function
   */
  onMessage(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Register connection state listener
   * @param {Function} listener - Connection state listener
   */
  onConnectionChange(listener) {
    this.connectionListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index !== -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - ID of the notification
   */
  markNotificationRead(notificationId) {
    this.sendMessage({
      type: 'mark_notification_read',
      notification_id: notificationId
    });
  }

  /**
   * Request pending tasks from server
   */
  requestPendingTasks() {
    this.sendMessage({
      type: 'get_pending_tasks'
    });
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔌 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);

    setTimeout(() => {
      if (!this.isConnected && this.userId) {
        console.log('🔌 Attempting to reconnect...');
        this.connect(this.userId);
      }
    }, this.reconnectDelay);

    // Exponential backoff with max 30 seconds
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.isConnected = false;
      this.socket.close(1000, 'User requested disconnect');
      this.socket = null;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.socket ? this.socket.readyState : null
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;