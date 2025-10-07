import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/api';
import { formatDateForUser, formatTimeForUser, getCurrentDateInUserTimezone, isToday } from '../../utils/timezone';

const TasksPage = ({ user }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayViewDate, setDayViewDate] = useState(new Date());
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });

  const { authFetch } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    console.log('fetchTasks called, user:', user);
    
    // Try different user_id fields
    const userId = user?.username;
    
    if (!userId) {
      console.error('No user_id found in user data:', user);
      setError('User not found. Please login again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tasks for user_id:', userId);
      
      const filterParams = { ...filters, limit: 100 };
      console.log('Filter params:', filterParams);
      
      const data = await taskService.getUserTasks(userId, filterParams, authFetch);
      console.log('API response:', data);
      
      if (data && data.success) {
        setTasks(data.tasks || []);
        console.log('Tasks loaded:', data.tasks?.length || 0);
      } else {
        setError(data?.error || 'Failed to fetch tasks');
        console.error('API error:', data?.error);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    
    // Get user timezone
    const userTimezone = user?.personality?.timezone || 'UTC';
    
    // Format the selected date
    const dateStr = date.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      // Convert UTC dueDate to user timezone for comparison
      const taskDateInUserTz = formatDateForUser(task.dueDate, userTimezone);
      return taskDateInUserTz === dateStr;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Day view helper functions
  const getTasksForHour = (date, hour) => {
    const userTimezone = user?.personality?.timezone || 'UTC';
    const dateStr = date.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      if (!task.dueDate || !task.dueTime) return false;
      
      // Convert UTC dueDate to user timezone for comparison
      const taskDateInUserTz = formatDateForUser(task.dueDate, userTimezone);
      if (taskDateInUserTz !== dateStr) return false;
      
      // Convert UTC dueTime to user timezone and parse hour
      const taskTimeInUserTz = formatTimeForUser(task.dueDate + 'T' + task.dueTime, userTimezone);
      const taskHour = parseInt(taskTimeInUserTz.split(':')[0]);
      return taskHour === hour;
    });
  };

  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const navigateDay = (direction) => {
    setDayViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  onClick={() => navigate('/notifications')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Thông báo
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
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Tasks
              </h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {tasks.length} tasks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">

            {/* View Mode & Filters */}
            <div className="flex items-center gap-4">
              {/* View Mode Buttons */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'month' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'day' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Day
                </button>
              </div>

              {/* Filters */}
              <select 
                value={filters.status} 
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select 
                value={filters.priority} 
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {viewMode === 'month' 
                      ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                      : dayViewDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                    }
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateDay(-1)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        if (viewMode === 'month') {
                          setCurrentDate(today);
                        } else {
                          setDayViewDate(today);
                        }
                      }}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateDay(1)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Content */}
              <div className="p-6">
                {viewMode === 'month' ? (
                  /* Month View */
                  <>
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {dayNames.map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentDate).map((date, index) => {
                        const dayTasks = date ? getTasksForDate(date) : [];
                        const isSelected = selectedDate && date && 
                          selectedDate.toDateString() === date.toDateString();
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-[100px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 ${
                              date 
                                ? isSelected
                                  ? 'bg-blue-100 border-blue-500'
                                  : isToday(date)
                                    ? 'bg-blue-50 border-blue-300'
                                    : 'hover:bg-gray-50'
                                : 'bg-gray-50 cursor-default'
                            }`}
                            onClick={() => date && setSelectedDate(date)}
                          >
                            {date && (
                              <>
                                <div className={`text-sm font-medium mb-1 ${
                                  isToday(date) ? 'text-blue-600' : 'text-gray-700'
                                }`}>
                                  {date.getDate()}
                                </div>
                                <div className="space-y-1">
                                  {dayTasks.slice(0, 3).map(task => (
                                    <div
                                      key={task.id}
                                      className={`text-xs p-1 rounded text-white truncate ${getStatusColor(task.status)}`}
                                      title={task.title}
                                    >
                                      {task.title}
                                    </div>
                                  ))}
                                  {dayTasks.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                      +{dayTasks.length - 3} more
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* Day View */
                  <div className="space-y-2">
                    {/* Hour Timeline */}
                    {generateHours().map(hour => {
                      const hourTasks = getTasksForHour(dayViewDate, hour);
                      const isCurrentHour = new Date().getHours() === hour && isToday(dayViewDate);
                      
                      return (
                        <div 
                          key={hour} 
                          className={`flex border-l-4 ${isCurrentHour ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} hover:bg-gray-50 transition-colors duration-200`}
                        >
                          {/* Time Column */}
                          <div className="w-20 p-3 text-right">
                            <div className={`text-sm font-medium ${isCurrentHour ? 'text-blue-600' : 'text-gray-600'}`}>
                              {formatHour(hour)}
                            </div>
                          </div>
                          
                          {/* Tasks Column */}
                          <div className="flex-1 p-3 min-h-[60px]">
                            {hourTasks.length > 0 ? (
                              <div className="space-y-2">
                                {hourTasks.map(task => (
                                  <div 
                                    key={task.id}
                                    className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)} shadow-sm hover:shadow-md transition-shadow duration-200`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                                      {task.dueTime && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {formatTimeForUser(task.dueDate + 'T' + task.dueTime, user?.personality?.timezone || 'UTC')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                      <span className="capitalize">Status: {task.status?.replace('_', ' ')}</span>
                                      <span className="capitalize">Priority: {task.priority}</span>
                                      {task.category && <span className="capitalize">Category: {task.category}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                No tasks scheduled
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Date Tasks or Day View Summary */}
            {viewMode === 'month' && selectedDate ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="space-y-3">
                  {getTasksForDate(selectedDate).map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border-2 ${getPriorityColor(task.priority)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                        <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="capitalize">Priority: {task.priority}</div>
                        <div className="capitalize">Status: {task.status?.replace('_', ' ')}</div>
                        {task.category && <div className="capitalize">Category: {task.category}</div>}
                        {task.dueTime && <div>Time: {formatTimeForUser(task.dueDate + 'T' + task.dueTime, user?.personality?.timezone || 'UTC')}</div>}
                      </div>
                    </div>
                  ))}
                  {getTasksForDate(selectedDate).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No tasks for this date</p>
                  )}
                </div>
              </div>
            ) : viewMode === 'day' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Day Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="font-semibold text-gray-800">
                      {getTasksForDate(dayViewDate).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">
                      {getTasksForDate(dayViewDate).filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-semibold text-blue-600">
                      {getTasksForDate(dayViewDate).filter(t => t.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">
                      {getTasksForDate(dayViewDate).filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                  
                  {/* Quick Actions for Day View */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setViewMode('month');
                          setSelectedDate(dayViewDate);
                          setCurrentDate(new Date(dayViewDate.getFullYear(), dayViewDate.getMonth(), 1));
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        📅 Switch to Month View
                      </button>
                      <button 
                        onClick={() => setDayViewDate(new Date())}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        🏠 Go to Today
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-gray-800">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;