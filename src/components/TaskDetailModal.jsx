/**
 * Task Detail Modal
 * Shows task details with edit/delete functionality
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './TaskDetailModal.css';

const TaskDetailModal = ({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted, startInEditMode = false }) => {
  const { authFetch } = useAuth();
  const [isEditing, setIsEditing] = useState(true); // Always start in edit mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    category: '',
    dueDate: '',
    dueTime: '',
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        category: task.category || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        dueTime: task.dueTime || '',
      });
    }
  }, [task]);

  // Clear states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsEditing(true); // Always in edit mode
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!task?.id) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        category: formData.category,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null,
        dueTime: formData.dueTime || null,
      };

      console.log('Updating task:', task.id, updateData);

      const response = await authFetch(`${API_BASE_URL}/api/v1/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setSuccess('Task updated successfully!');
        
        // Notify parent component
        if (onTaskUpdated) {
          onTaskUpdated({
            ...task,
            ...updateData,
            dueDate: updateData.dueDate
          });
        }
        
        // Auto close after 1.5 seconds
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
    if (!confirmed) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';
      
      console.log('Deleting task:', task.id);

      const response = await authFetch(`${API_BASE_URL}/api/v1/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Task deleted successfully!');
        
        // Notify parent component
        if (onTaskDeleted) {
          onTaskDeleted(task.id);
        }
        
        // Auto close after 1 second
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen || !task) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-modal-header">
          <h2>📝 Edit Task</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="task-modal-content">
          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              ❌ {error}
            </div>
          )}

          {/* Task Information */}
          <div className="task-info">
            {/* Title */}
            <div className="form-group">
              <label>📌 Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>📄 Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter task description..."
                rows={3}
              />
            </div>

            {/* Status and Priority Row */}
            <div className="form-row">
              <div className="form-group">
                <label>📊 Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="in_progress">🔄 In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>🎯 Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>🏷️ Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter task category..."
              />
            </div>

            {/* Due Date and Time Row */}
            <div className="form-row">
              <div className="form-group">
                <label>📅 Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>⏰ Due Time</label>
                <input
                  type="time"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="task-metadata">
              <div className="metadata-item">
                <strong>🆔 ID:</strong> {task.id}
              </div>
              {task.createdAt && (
                <div className="metadata-item">
                  <strong>✨ Created:</strong> {new Date(task.createdAt).toLocaleString('vi-VN')}
                </div>
              )}
              {task.updatedAt && (
                <div className="metadata-item">
                  <strong>🔄 Updated:</strong> {new Date(task.updatedAt).toLocaleString('vi-VN')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="task-modal-footer">
          <button 
            className="btn btn-danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? '⏳ Deleting...' : '🗑️ Delete Task'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            ❌ Close
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={loading || !formData.title.trim()}
          >
            {loading ? '⏳ Saving...' : '💾 Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;