/**
 * Timezone utility functions for handling UTC storage and user timezone display
 */

/**
 * Format UTC datetime to user's timezone
 * @param {string|Date} utcDateTime - UTC datetime (string or Date object)
 * @param {string} userTimezone - User's timezone (e.g., 'Asia/Ho_Chi_Minh')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted datetime string in user timezone
 */
export const formatDateTimeForUser = (utcDateTime, userTimezone = 'UTC', options = {}) => {
  if (!utcDateTime) return '';
  
  try {
    // Convert to Date object if string
    const date = typeof utcDateTime === 'string' ? new Date(utcDateTime) : utcDateTime;
    
    // Default formatting options
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimezone,
      hour12: false
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-CA', formatOptions).format(date);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return utcDateTime.toString();
  }
};

/**
 * Format UTC date to user's timezone (date only)
 * @param {string|Date} utcDate - UTC date
 * @param {string} userTimezone - User's timezone
 * @returns {string} Formatted date string (YYYY-MM-DD) in user timezone
 */
export const formatDateForUser = (utcDate, userTimezone = 'UTC') => {
  return formatDateTimeForUser(utcDate, userTimezone, {
    hour: undefined,
    minute: undefined,
    timeZone: userTimezone
  });
};

/**
 * Format UTC time to user's timezone (time only)
 * @param {string|Date} utcDateTime - UTC datetime
 * @param {string} userTimezone - User's timezone  
 * @returns {string} Formatted time string (HH:MM) in user timezone
 */
export const formatTimeForUser = (utcDateTime, userTimezone = 'UTC') => {
  if (!utcDateTime) return '';
  
  try {
    const date = typeof utcDateTime === 'string' ? new Date(utcDateTime) : utcDateTime;
    
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimezone,
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Convert user local datetime to UTC for API submission
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM format
 * @param {string} userTimezone - User's timezone
 * @returns {string} UTC ISO string
 */
export const convertToUTC = (dateStr, timeStr = '00:00', userTimezone = 'UTC') => {
  if (!dateStr) return null;
  
  try {
    // Create datetime string
    const datetimeStr = `${dateStr}T${timeStr}:00`;
    
    // Create date assuming it's in user timezone
    const tempDate = new Date(datetimeStr);
    
    // Get the offset for user timezone at this date
    const utcDate = new Date(tempDate.toLocaleString("en-US", {timeZone: "UTC"}));
    const userDate = new Date(tempDate.toLocaleString("en-US", {timeZone: userTimezone}));
    const offset = utcDate.getTime() - userDate.getTime();
    
    // Apply offset to get correct UTC time
    const correctUTC = new Date(tempDate.getTime() + offset);
    
    return correctUTC.toISOString();
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return null;
  }
};

/**
 * Get current date in user's timezone
 * @param {string} userTimezone - User's timezone
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDateInUserTimezone = (userTimezone = 'UTC') => {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    }).format(now);
  } catch (error) {
    console.error('Error getting current date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Get current time in user's timezone
 * @param {string} userTimezone - User's timezone
 * @returns {string} Current time in HH:MM format
 */
export const getCurrentTimeInUserTimezone = (userTimezone = 'UTC') => {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
  } catch (error) {
    console.error('Error getting current time:', error);
    return new Date().toTimeString().split(' ')[0].substring(0, 5);
  }
};

/**
 * Check if a UTC datetime is today in user's timezone
 * @param {string|Date} utcDateTime - UTC datetime
 * @param {string} userTimezone - User's timezone
 * @returns {boolean} True if datetime is today in user timezone
 */
export const isToday = (utcDateTime, userTimezone = 'UTC') => {
  if (!utcDateTime) return false;
  
  try {
    const today = getCurrentDateInUserTimezone(userTimezone);
    const dateToCheck = formatDateForUser(utcDateTime, userTimezone);
    return today === dateToCheck;
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};