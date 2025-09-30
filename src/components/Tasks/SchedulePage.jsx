import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const SchedulePage = ({ user }) => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayViewDate, setDayViewDate] = useState(new Date());

  const { authFetch } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    console.log('fetchSchedules called, user:', user);
    
    // Try different user_id fields
    const userId = user?.profile?.user_id || user?.user_id || user?.id || user?.username;
    
    if (!userId) {
      console.error('No user_id found in user data:', user);
      setError('User not found. Please login again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching schedules for user_id:', userId);
      
      const url = `${API_BASE_URL}/api/v1/schedules/${userId}?days_ahead=30`;
      console.log('Fetching from URL:', url);
      
      const response = await authFetch(url, {
        method: 'GET',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data && data.success) {
        setSchedules(data.schedule_entries || []);
        console.log('Schedules loaded:', data.schedule_entries?.length || 0);
      } else {
        setError(data?.error || 'Failed to fetch schedules');
        console.error('API error:', data?.error);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(`Failed to load schedules: ${err.message}`);
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

  const getSchedulesForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => {
      if (!schedule.scheduled_date) return false;
      const scheduleDate = new Date(schedule.scheduled_date).toISOString().split('T')[0];
      return scheduleDate === dateStr;
    });
  };

  const getSchedulesForHour = (date, hour) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => {
      if (!schedule.scheduled_date || !schedule.start_time) return false;
      const scheduleDate = new Date(schedule.scheduled_date).toISOString().split('T')[0];
      if (scheduleDate !== dateStr) return false;
      
      // Parse schedule time
      const scheduleHour = parseInt(schedule.start_time.split(':')[0]);
      return scheduleHour === hour;
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

  const getScheduleTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'meeting': return 'bg-blue-500';
      case 'appointment': return 'bg-green-500';
      case 'event': return 'bg-purple-500';
      case 'reminder': return 'bg-yellow-500';
      case 'break': return 'bg-gray-500';
      default: return 'bg-indigo-500';
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

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Schedule</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSchedules}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4m-4 8V9M8 21l4-4 4 4m-4-4V9m-8 4h16" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Schedule Calendar</h1>
                  <p className="text-sm text-gray-500">{schedules.length} schedule entries</p>
                </div>
              </div>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-4">
              {/* View Mode Buttons */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'month' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'day' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Day
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
                      className="px-3 py-1 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
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
                        const daySchedules = date ? getSchedulesForDate(date) : [];
                        const isSelected = selectedDate && date && 
                          selectedDate.toDateString() === date.toDateString();
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-[100px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 ${
                              date 
                                ? isSelected
                                  ? 'bg-purple-100 border-purple-500'
                                  : isToday(date)
                                    ? 'bg-purple-50 border-purple-300'
                                    : 'hover:bg-gray-50'
                                : 'bg-gray-50 cursor-default'
                            }`}
                            onClick={() => date && setSelectedDate(date)}
                          >
                            {date && (
                              <>
                                <div className={`text-sm font-medium mb-1 ${
                                  isToday(date) ? 'text-purple-600' : 'text-gray-700'
                                }`}>
                                  {date.getDate()}
                                </div>
                                <div className="space-y-1">
                                  {daySchedules.slice(0, 3).map(schedule => (
                                    <div
                                      key={schedule.id}
                                      className={`text-xs p-1 rounded text-white truncate ${getScheduleTypeColor(schedule.type)}`}
                                      title={schedule.title || schedule.description}
                                    >
                                      {schedule.title || schedule.description || 'Schedule Entry'}
                                    </div>
                                  ))}
                                  {daySchedules.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                      +{daySchedules.length - 3} more
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
                      const hourSchedules = getSchedulesForHour(dayViewDate, hour);
                      const isCurrentHour = new Date().getHours() === hour && isToday(dayViewDate);
                      
                      return (
                        <div 
                          key={hour} 
                          className={`flex border-l-4 ${isCurrentHour ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} hover:bg-gray-50 transition-colors duration-200`}
                        >
                          {/* Time Column */}
                          <div className="w-20 p-3 text-right">
                            <div className={`text-sm font-medium ${isCurrentHour ? 'text-purple-600' : 'text-gray-600'}`}>
                              {formatHour(hour)}
                            </div>
                          </div>
                          
                          {/* Schedule Column */}
                          <div className="flex-1 p-3 min-h-[60px]">
                            {hourSchedules.length > 0 ? (
                              <div className="space-y-2">
                                {hourSchedules.map(schedule => (
                                  <div 
                                    key={schedule.id}
                                    className={`p-3 rounded-lg border-l-4 ${getPriorityColor(schedule.priority)} shadow-sm hover:shadow-md transition-shadow duration-200`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
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
                                No schedule entries
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
            {/* Selected Date Schedules or Day View Summary */}
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
                  {getSchedulesForDate(selectedDate).map(schedule => (
                    <div
                      key={schedule.id}
                      className={`p-3 rounded-lg border-2 ${getPriorityColor(schedule.priority)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getScheduleTypeColor(schedule.type)}`}></div>
                        <h4 className="font-medium text-gray-800 text-sm">
                          {schedule.title || schedule.description || 'Schedule Entry'}
                        </h4>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {schedule.type && <div className="capitalize">Type: {schedule.type}</div>}
                        {schedule.priority && <div className="capitalize">Priority: {schedule.priority}</div>}
                        {schedule.start_time && <div>Time: {schedule.start_time}</div>}
                        {schedule.location && <div>Location: {schedule.location}</div>}
                      </div>
                    </div>
                  ))}
                  {getSchedulesForDate(selectedDate).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No schedule for this date</p>
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
                    <span className="text-sm text-gray-600">Total Entries</span>
                    <span className="font-semibold text-gray-800">
                      {getSchedulesForDate(dayViewDate).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Meetings</span>
                    <span className="font-semibold text-blue-600">
                      {getSchedulesForDate(dayViewDate).filter(s => s.type === 'meeting').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Appointments</span>
                    <span className="font-semibold text-green-600">
                      {getSchedulesForDate(dayViewDate).filter(s => s.type === 'appointment').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Events</span>
                    <span className="font-semibold text-purple-600">
                      {getSchedulesForDate(dayViewDate).filter(s => s.type === 'event').length}
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
                        className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Entries</span>
                  <span className="font-semibold text-gray-800">{schedules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meetings</span>
                  <span className="font-semibold text-blue-600">
                    {schedules.filter(s => s.type === 'meeting').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Appointments</span>
                  <span className="font-semibold text-green-600">
                    {schedules.filter(s => s.type === 'appointment').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Events</span>
                  <span className="font-semibold text-purple-600">
                    {schedules.filter(s => s.type === 'event').length}
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

export default SchedulePage;