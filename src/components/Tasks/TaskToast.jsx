import { useState, useEffect } from "react";

export const TaskToast = ({ taskData, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (taskData) {
      setIsVisible(true);
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [taskData]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!taskData || !isVisible) return null;

  const getOperationInfo = () => {
    switch (taskData.operation) {
      case 'query':
        return {
          icon: '🔍',
          title: `Found ${taskData.count} Tasks`,
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-400'
        };
      case 'update':
        return {
          icon: '✏️',
          title: `Updated ${taskData.count} Task(s)`,
          bgColor: 'bg-green-500', 
          borderColor: 'border-green-400'
        };
      case 'mark_complete':
        return {
          icon: '✅',
          title: `Completed ${taskData.count} Task(s)`,
          bgColor: 'bg-emerald-500',
          borderColor: 'border-emerald-400'
        };
      case 'delete':
        return {
          icon: '🗑️',
          title: `Deleted ${taskData.count} Task(s)`,
          bgColor: 'bg-red-500',
          borderColor: 'border-red-400'
        };
      default:
        return {
          icon: '📋',
          title: 'Task Operation',
          bgColor: 'bg-gray-500',
          borderColor: 'border-gray-400'
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatDateTime = (date, time) => {
    if (!date && !time) return null;
    
    const dateStr = date ? new Date(date).toLocaleDateString() : '';
    const timeStr = time || '';
    
    return `${dateStr} ${timeStr}`.trim();
  };

  const operationInfo = getOperationInfo();

  return (
    <div className={`fixed top-20 right-4 z-50 max-w-md w-80 transform transition-all duration-300 ${
      isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className={`${operationInfo.bgColor} ${operationInfo.borderColor} border-2 rounded-lg shadow-xl backdrop-blur-md bg-opacity-90`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">{operationInfo.icon}</span>
            <h3 className="font-semibold text-sm">{operationInfo.title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Task List */}
        <div className="bg-white bg-opacity-95 max-h-60 overflow-y-auto">
          {taskData.tasks.slice(0, 5).map((task, index) => (
            <div key={task.id || task.task_id || index} className="p-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate" title={task.title}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {task.priority && (
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    )}
                    {task.status && (
                      <span className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    )}
                    {task.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                        {task.category}
                      </span>
                    )}
                  </div>
                  {formatDateTime(task.due_date, task.due_time) && (
                    <div className="text-xs text-gray-500 mt-1">
                      📅 {formatDateTime(task.due_date, task.due_time)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {taskData.tasks.length > 5 && (
            <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
              +{taskData.tasks.length - 5} more tasks
            </div>
          )}
        </div>

        {/* Footer */}
        {taskData.operation === 'query' && taskData.filters && (
          <div className="p-2 bg-gray-50 text-xs text-gray-600">
            <div className="flex items-center gap-2 flex-wrap">
              {taskData.filters.status && taskData.filters.status !== 'all' && (
                <span className="bg-white px-2 py-1 rounded">Status: {taskData.filters.status}</span>
              )}
              {taskData.filters.priority && taskData.filters.priority !== 'all' && (
                <span className="bg-white px-2 py-1 rounded">Priority: {taskData.filters.priority}</span>
              )}
              {taskData.filters.timeRange && taskData.filters.timeRange !== 'all' && (
                <span className="bg-white px-2 py-1 rounded">Time: {taskData.filters.timeRange}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};