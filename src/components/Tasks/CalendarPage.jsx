import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/api';
import TaskDetailModal from './TaskDetailModal';

const CalendarPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [contentType, setContentType] = useState('both'); // 'tasks', 'schedules', 'both'
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayViewDate, setDayViewDate] = useState(new Date());
  const [weekViewDate, setWeekViewDate] = useState(new Date());
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [startInEditMode, setStartInEditMode] = useState(false);

  const { authFetch } = useAuth();
  const API_BASE_URL =  'https://task-agent-api.ngrok.dev';

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    // Update task in local state
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );
    
    // Refresh data from server
    setTimeout(() => {
      fetchData();
    }, 500);
  };

  const handleTaskDeleted = (taskId) => {
    // Remove task from local state
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    // Refresh data from server
    setTimeout(() => {
      fetchData();
    }, 500);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setStartInEditMode(false);
    // Clear URL params when closing modal
    if (searchParams.has('openTask')) {
      setSearchParams({});
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, contentType]);

  // Handle URL params to open task modal automatically
  useEffect(() => {
    const openTaskId = searchParams.get('openTask');
    const editMode = searchParams.get('editMode') === 'true';
    
    if (openTaskId && tasks.length > 0) {
      // Try to find task in current tasks list
      let taskToOpen = tasks.find(task => task.id === openTaskId);
      
      // If not found in tasks, check if task data was passed via location state
      if (!taskToOpen && location.state && location.state.task) {
        taskToOpen = location.state.task;
      }
      
      if (taskToOpen) {
        setSelectedTask(taskToOpen);
        setStartInEditMode(editMode);
        setIsTaskModalOpen(true);
      }
    }
  }, [tasks, searchParams, location.state]);

  const fetchData = async () => {
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
      
      const promises = [];
      
      // Fetch tasks if needed
      if (contentType === 'tasks' || contentType === 'both') {
        promises.push(
          taskService.getUserTasks(userId, { ...filters, limit: 100 }, authFetch)
        );
      } else {
        promises.push(Promise.resolve({ success: true, tasks: [] }));
      }
      
      // Fetch schedules if needed
      if (contentType === 'schedules' || contentType === 'both') {
        const scheduleUrl = `${API_BASE_URL}/api/v1/schedules/${userId}?days_ahead=30`;
        promises.push(
          authFetch(scheduleUrl, { method: 'GET' }).then(res => res.json())
        );
      } else {
        promises.push(Promise.resolve({ success: true, schedule_entries: [] }));
      }
      
      const [taskData, scheduleData] = await Promise.all(promises);
      
      if (taskData.success) {
        setTasks(taskData.tasks || []);
      }
      
      if (scheduleData.success) {
        setSchedules(scheduleData.schedule_entries || []);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${err.message}`);
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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getItemsForDate = (date) => {
    if (!date) return { tasks: [], schedules: [] };
    
    // Format date consistently using local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayTasks = tasks.filter(task => {
      // Use due_date (new format) or fallback to dueDate (old format)
      const taskDueDate = task.due_date || task.dueDate;
      if (!taskDueDate) return false;
      
      // Parse task date consistently
      const taskDateObj = new Date(taskDueDate);
      const taskYear = taskDateObj.getFullYear();
      const taskMonth = String(taskDateObj.getMonth() + 1).padStart(2, '0');
      const taskDay = String(taskDateObj.getDate()).padStart(2, '0');
      const taskDate = `${taskYear}-${taskMonth}-${taskDay}`;
      
      return taskDate === dateStr;
    });
    
    const daySchedules = schedules.filter(schedule => {
      if (!schedule.scheduled_date) return false;
      
      // Parse schedule date consistently
      const scheduleDateObj = new Date(schedule.scheduled_date);
      const scheduleYear = scheduleDateObj.getFullYear();
      const scheduleMonth = String(scheduleDateObj.getMonth() + 1).padStart(2, '0');
      const scheduleDay = String(scheduleDateObj.getDate()).padStart(2, '0');
      const scheduleDate = `${scheduleYear}-${scheduleMonth}-${scheduleDay}`;
      
      return scheduleDate === dateStr;
    });
    
    return { tasks: dayTasks, schedules: daySchedules };
  };

  const getItemsForHour = (date, hour) => {
    // Format date consistently using local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const hourTasks = tasks.filter(task => {
      // Use due_date and due_time (new format) or fallback to old format
      const taskDueDate = task.due_date || task.dueDate;
      const taskDueTime = task.due_time || task.dueTime;
      if (!taskDueDate || !taskDueTime) return false;
      
      // Parse task date consistently
      const taskDateObj = new Date(taskDueDate);
      const taskYear = taskDateObj.getFullYear();
      const taskMonth = String(taskDateObj.getMonth() + 1).padStart(2, '0');
      const taskDay = String(taskDateObj.getDate()).padStart(2, '0');
      const taskDate = `${taskYear}-${taskMonth}-${taskDay}`;
      
      if (taskDate !== dateStr) return false;
      
      const taskHour = parseInt(taskDueTime.split(':')[0]);
      return taskHour === hour;
    });
    
    const hourSchedules = schedules.filter(schedule => {
      if (!schedule.scheduled_date || !schedule.start_time) return false;
      
      // Parse schedule date consistently
      const scheduleDateObj = new Date(schedule.scheduled_date);
      const scheduleYear = scheduleDateObj.getFullYear();
      const scheduleMonth = String(scheduleDateObj.getMonth() + 1).padStart(2, '0');
      const scheduleDay = String(scheduleDateObj.getDate()).padStart(2, '0');
      const scheduleDate = `${scheduleYear}-${scheduleMonth}-${scheduleDay}`;
      
      if (scheduleDate !== dateStr) return false;
      
      const scheduleHour = parseInt(schedule.start_time.split(':')[0]);
      return scheduleHour === hour;
    });
    
    return { tasks: hourTasks, schedules: hourSchedules };
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

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getScheduleTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'meeting': return 'bg-purple-500';
      case 'appointment': return 'bg-indigo-500';
      case 'event': return 'bg-pink-500';
      case 'reminder': return 'bg-orange-500';
      case 'break': return 'bg-gray-500';
      default: return 'bg-teal-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
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

  const navigateDay = (direction) => {
    setDayViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setWeekViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      weekDays.push(currentDay);
    }
    return weekDays;
  };

  const getWeekRange = (date) => {
    const weekDays = getWeekDays(date);
    const startDate = weekDays[0];
    const endDate = weekDays[6];
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${monthNames[startDate.getMonth()]} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
      return `${monthNames[startDate.getMonth()]} ${startDate.getDate()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Calendar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-cyan-100">
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
            <div className="absolute left-1/2 transform -translate-x-1/2 ml-2">
              <h1 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-violet-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4m-4 8V9M8 21l4-4 4 4m-4-4V9m-8 4h16" />
                </svg>
                Calendar
              </h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {tasks.length} tasks • {schedules.length} schedules
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Content Type Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setContentType('both')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    contentType === 'both' 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setContentType('tasks')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    contentType === 'tasks' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setContentType('schedules')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    contentType === 'schedules' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Schedule
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'month' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'week' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'day' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Day
                </button>
              </div>

              {/* Filters for Tasks */}
              {(contentType === 'tasks' || contentType === 'both') && (
                <>
                  <select 
                    value={filters.status} 
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <select 
                    value={filters.priority} 
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </>
              )}

              {/* Notifications Link */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/notifications')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 bg-purple-500 text-white hover:bg-purple-600"
                >
                  🔔 Thông báo
                </button>
              </div>

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
                      : viewMode === 'week'
                        ? getWeekRange(weekViewDate)
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
                      onClick={() => {
                        if (viewMode === 'month') navigateMonth(-1);
                        else if (viewMode === 'week') navigateWeek(-1);
                        else navigateDay(-1);
                      }}
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
                        } else if (viewMode === 'week') {
                          setWeekViewDate(today);
                        } else {
                          setDayViewDate(today);
                        }
                      }}
                      className="px-3 py-1 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors duration-200"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        if (viewMode === 'month') navigateMonth(1);
                        else if (viewMode === 'week') navigateWeek(1);
                        else navigateDay(1);
                      }}
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
                        const { tasks: dayTasks, schedules: daySchedules } = date ? getItemsForDate(date) : { tasks: [], schedules: [] };
                        const isSelected = selectedDate && date && 
                          selectedDate.toDateString() === date.toDateString();
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 ${
                              date 
                                ? isSelected
                                  ? 'bg-violet-100 border-violet-500'
                                  : isToday(date)
                                    ? 'bg-violet-50 border-violet-300'
                                    : 'hover:bg-gray-50'
                                : 'bg-gray-50 cursor-default'
                            }`}
                            onClick={() => date && setSelectedDate(date)}
                          >
                            {date && (
                              <>
                                <div className={`text-sm font-medium mb-2 ${
                                  isToday(date) ? 'text-violet-600' : 'text-gray-700'
                                }`}>
                                  {date.getDate()}
                                </div>
                                <div className="space-y-1">
                                  {/* Tasks */}
                                  {dayTasks.slice(0, 2).map(task => (
                                    <div
                                      key={`task-${task.id}`}
                                      className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${getTaskStatusColor(task.status)}`}
                                      title={`Task: ${task.title}${task.referenceLinks && task.referenceLinks.length > 0 ? ' (Has reference links)' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskClick(task);
                                      }}
                                    >
                                      📝 {task.title}
                                      {task.referenceLinks && task.referenceLinks.length > 0 && (
                                        <span className="ml-1" title="Has reference links">🔗</span>
                                      )}
                                    </div>
                                  ))}
                                  {/* Schedules */}
                                  {daySchedules.slice(0, 2).map(schedule => (
                                    <div
                                      key={`schedule-${schedule.id}`}
                                      className={`text-xs p-1 rounded text-white truncate ${getScheduleTypeColor(schedule.type)}`}
                                      title={`Schedule: ${schedule.title || schedule.description}`}
                                    >
                                      📅 {schedule.title || schedule.description}
                                    </div>
                                  ))}
                                  {(dayTasks.length + daySchedules.length) > 4 && (
                                    <div className="text-xs text-gray-500">
                                      +{(dayTasks.length + daySchedules.length) - 4} more
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
                ) : viewMode === 'week' ? (
                  /* Week View */
                  <>
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {dayNames.map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {getWeekDays(weekViewDate).map((date, index) => {
                        const { tasks: dayTasks, schedules: daySchedules } = getItemsForDate(date);
                        const isSelected = selectedDate && 
                          selectedDate.toDateString() === date.toDateString();
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-[200px] p-3 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-violet-100 border-violet-500'
                                : isToday(date)
                                  ? 'bg-violet-50 border-violet-300'
                                  : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <div className={`text-lg font-medium mb-3 ${
                              isToday(date) ? 'text-violet-600' : 'text-gray-700'
                            }`}>
                              <div className="text-xs text-gray-500 uppercase">
                                {dayNames[date.getDay()]}
                              </div>
                              <div>
                                {date.getDate()}
                              </div>
                            </div>
                            <div className="space-y-2">
                              {/* Tasks */}
                              {dayTasks.slice(0, 3).map(task => (
                                <div
                                  key={`task-${task.id}`}
                                  className={`text-xs p-2 rounded text-white cursor-pointer hover:opacity-80 ${getTaskStatusColor(task.status)}`}
                                  title={`Task: ${task.title}${task.referenceLinks && task.referenceLinks.length > 0 ? ' (Has reference links)' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskClick(task);
                                  }}
                                >
                                  <div className="font-medium truncate">📝 {task.title}</div>
                                  {(task.due_time || task.dueTime) && (
                                    <div className="text-xs opacity-90 mt-1">
                                      {task.due_time || task.dueTime}
                                    </div>
                                  )}
                                  {task.referenceLinks && task.referenceLinks.length > 0 && (
                                    <span className="text-xs opacity-90" title="Has reference links">🔗</span>
                                  )}
                                </div>
                              ))}
                              {/* Schedules */}
                              {daySchedules.slice(0, 3).map(schedule => (
                                <div
                                  key={`schedule-${schedule.id}`}
                                  className={`text-xs p-2 rounded text-white ${getScheduleTypeColor(schedule.type)}`}
                                  title={`Schedule: ${schedule.title || schedule.description}`}
                                >
                                  <div className="font-medium truncate">📅 {schedule.title || schedule.description}</div>
                                  {schedule.start_time && (
                                    <div className="text-xs opacity-90 mt-1">
                                      {schedule.start_time}
                                      {schedule.end_time && ` - ${schedule.end_time}`}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {(dayTasks.length + daySchedules.length) > 6 && (
                                <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded text-center">
                                  +{(dayTasks.length + daySchedules.length) - 6} more
                                </div>
                              )}
                            </div>
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
                      const { tasks: hourTasks, schedules: hourSchedules } = getItemsForHour(dayViewDate, hour);
                      const isCurrentHour = new Date().getHours() === hour && isToday(dayViewDate);
                      
                      return (
                        <div 
                          key={hour} 
                          className={`flex border-l-4 ${isCurrentHour ? 'border-violet-500 bg-violet-50' : 'border-gray-200'} hover:bg-gray-50 transition-colors duration-200`}
                        >
                          {/* Time Column */}
                          <div className="w-20 p-3 text-right">
                            <div className={`text-sm font-medium ${isCurrentHour ? 'text-violet-600' : 'text-gray-600'}`}>
                              {formatHour(hour)}
                            </div>
                          </div>
                          
                          {/* Items Column */}
                          <div className="flex-1 p-3 min-h-[60px]">
                            {(hourTasks.length > 0 || hourSchedules.length > 0) ? (
                              <div className="space-y-2">
                                {/* Tasks */}
                                {hourTasks.map(task => (
                                  <div 
                                    key={`task-${task.id}`}
                                    className={`p-3 rounded-lg border-l-4 cursor-pointer ${getPriorityColor(task.priority)} shadow-sm hover:shadow-md transition-shadow duration-200`}
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">TASK</span>
                                      <div className={`w-3 h-3 rounded-full ${getTaskStatusColor(task.status)}`}></div>
                                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                                      {(task.due_time || task.dueTime) && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {task.due_time || task.dueTime}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                      <span className="capitalize">Status: {task.status?.replace('_', ' ')}</span>
                                      <span className="capitalize">Priority: {task.priority}</span>
                                      {task.category && <span className="capitalize">Category: {task.category}</span>}
                                      {task.referenceLinks && task.referenceLinks.length > 0 && (
                                        <span className="text-blue-600 flex items-center gap-1">
                                          🔗 {task.referenceLinks.length} link{task.referenceLinks.length > 1 ? 's' : ''}
                                        </span>
                                      )}
                                      {task.subtasks && task.subtasks.length > 0 && (
                                        <span className="text-green-600 flex items-center gap-1">
                                          ✅ {task.subtasks.length} step{task.subtasks.length > 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Schedules */}
                                {hourSchedules.map(schedule => (
                                  <div 
                                    key={`schedule-${schedule.id}`}
                                    className={`p-3 rounded-lg border-l-4 ${getPriorityColor(schedule.priority)} shadow-sm hover:shadow-md transition-shadow duration-200`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">SCHEDULE</span>
                                      <div className={`w-3 h-3 rounded-full ${getScheduleTypeColor(schedule.type)}`}></div>
                                      <h4 className="font-medium text-gray-800">
                                        {schedule.title || schedule.description || 'Schedule Entry'}
                                      </h4>
                                      {schedule.start_time && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {schedule.start_time}
                                          {schedule.end_time && ` - ${schedule.end_time}`}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                      {schedule.type && <span className="capitalize">Type: {schedule.type}</span>}
                                      {schedule.priority && <span className="capitalize">Priority: {schedule.priority}</span>}
                                      {schedule.location && <span>📍 {schedule.location}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                No items scheduled
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
            {/* Selected Date Items or Day View Summary */}
            {(viewMode === 'month' || viewMode === 'week') && selectedDate ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const { tasks: dayTasks, schedules: daySchedules } = getItemsForDate(selectedDate);
                    return (
                      <>
                        {/* Tasks */}
                        {dayTasks.map(task => (
                          <div
                            key={`task-${task.id}`}
                            className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow duration-200 ${getPriorityColor(task.priority)}`}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">TASK</span>
                              <div className={`w-3 h-3 rounded-full ${getTaskStatusColor(task.status)}`}></div>
                              <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="capitalize">Status: {task.status?.replace('_', ' ')}</div>
                              <div className="capitalize">Priority: {task.priority}</div>
                              {(task.due_time || task.dueTime) && <div>Time: {task.due_time || task.dueTime}</div>}
                              {task.referenceLinks && task.referenceLinks.length > 0 && (
                                <div className="text-blue-600">🔗 {task.referenceLinks.length} reference link{task.referenceLinks.length > 1 ? 's' : ''}</div>
                              )}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="text-green-600">✅ {task.subtasks.length} subtask{task.subtasks.length > 1 ? 's' : ''}</div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Schedules */}
                        {daySchedules.map(schedule => (
                          <div
                            key={`schedule-${schedule.id}`}
                            className={`p-3 rounded-lg border-2 ${getPriorityColor(schedule.priority)}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">SCHEDULE</span>
                              <div className={`w-3 h-3 rounded-full ${getScheduleTypeColor(schedule.type)}`}></div>
                              <h4 className="font-medium text-gray-800 text-sm">
                                {schedule.title || schedule.description || 'Schedule Entry'}
                              </h4>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              {schedule.type && <div className="capitalize">Type: {schedule.type}</div>}
                              {schedule.start_time && <div>Time: {schedule.start_time}</div>}
                              {schedule.location && <div>Location: {schedule.location}</div>}
                            </div>
                          </div>
                        ))}
                        
                        {(dayTasks.length + daySchedules.length) === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">No items for this date</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : viewMode === 'week' ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Week Summary
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const weekDays = getWeekDays(weekViewDate);
                    let totalTasks = 0;
                    let totalSchedules = 0;
                    
                    weekDays.forEach(date => {
                      const { tasks: dayTasks, schedules: daySchedules } = getItemsForDate(date);
                      totalTasks += dayTasks.length;
                      totalSchedules += daySchedules.length;
                    });
                    
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Items</span>
                          <span className="font-semibold text-gray-800">
                            {totalTasks + totalSchedules}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tasks</span>
                          <span className="font-semibold text-blue-600">{totalTasks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Schedule Entries</span>
                          <span className="font-semibold text-purple-600">{totalSchedules}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Week Range</span>
                          <span className="font-semibold text-cyan-600 text-xs">
                            {getWeekRange(weekViewDate)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                  
                  {/* Quick Actions for Week View */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setViewMode('month');
                          setCurrentDate(new Date(weekViewDate.getFullYear(), weekViewDate.getMonth(), 1));
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors duration-200"
                      >
                        📅 Switch to Month View
                      </button>
                      <button 
                        onClick={() => {
                          setViewMode('day');
                          setDayViewDate(weekViewDate);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        📋 Switch to Day View
                      </button>
                      <button 
                        onClick={() => setWeekViewDate(new Date())}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        🏠 Go to This Week
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === 'day' ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Day Summary
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const { tasks: dayTasks, schedules: daySchedules } = getItemsForDate(dayViewDate);
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Items</span>
                          <span className="font-semibold text-gray-800">
                            {dayTasks.length + daySchedules.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tasks</span>
                          <span className="font-semibold text-blue-600">{dayTasks.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Schedule Entries</span>
                          <span className="font-semibold text-purple-600">{daySchedules.length}</span>
                        </div>
                      </>
                    );
                  })()}
                  
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
                        className="w-full text-left px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors duration-200"
                      >
                        📅 Switch to Month View
                      </button>
                      <button 
                        onClick={() => {
                          setViewMode('week');
                          setWeekViewDate(dayViewDate);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors duration-200"
                      >
                        📊 Switch to Week View
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
            ) : null}

            {/* Overall Stats Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-blue-600">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Tasks</span>
                  <span className="font-semibold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Schedule Entries</span>
                  <span className="font-semibold text-purple-600">{schedules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meetings</span>
                  <span className="font-semibold text-indigo-600">
                    {schedules.filter(s => s.type === 'meeting').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
        startInEditMode={startInEditMode}
      />
    </div>
  );
};

export default CalendarPage;