/**
 * Centralized utility functions for date and time formatting
 * 
 * Provides consistent date/time handling across all modules with timezone support
 * for Algeria (UTC+1) and multiple format options.
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 * @updated 02-11-2026 - Added formatDate, formatTime, and additional formatting utilities
 */

/**
 * Date format options
 */
export type DateFormat = 'dd-MM-yyyy' | 'yyyy-MM-dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy';

/**
 * Time format options
 */
export type TimeFormat = 'HH:mm' | 'HH:mm:ss' | 'hh:mm A' | 'hh:mm:ss A';

/**
 * Get current local datetime in format for datetime-local input
 * Accounts for timezone offset to show correct local time
 * 
 * @returns {string} Format: YYYY-MM-DDTHH:mm (local time)
 * @example
 * getCurrentLocalDateTime() // "2026-02-11T14:30"
 */
export const getCurrentLocalDateTime = (): string => {
  const now = new Date();
  // Adjust for timezone offset to get true local time
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

/**
 * Convert Date object to datetime-local input format
 * Preserves local time without timezone conversion
 * 
 * @param date - Date object to convert
 * @returns {string} Format: YYYY-MM-DDTHH:mm (local time)
 * @example
 * toLocalDateTimeString(new Date()) // "2026-02-11T14:30"
 */
export const toLocalDateTimeString = (date: Date): string => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
};

/**
 * Convert ISO string to datetime-local input format
 * Useful for populating inputs with data from backend
 * 
 * @param isoString - ISO 8601 datetime string
 * @returns {string} Format: YYYY-MM-DDTHH:mm (local time)
 * @example
 * isoToLocalDateTimeString("2026-02-11T13:30:00Z") // "2026-02-11T14:30"
 */
export const isoToLocalDateTimeString = (isoString: string): string => {
  return toLocalDateTimeString(new Date(isoString));
};

/**
 * Convert datetime-local input value to UTC ISO string for backend
 * 
 * @param localDateTime - datetime-local value (YYYY-MM-DDTHH:mm)
 * @returns {string} ISO 8601 UTC string
 * @example
 * fromLocalDateTimeString("2026-02-11T14:30") // "2026-02-11T13:30:00.000Z"
 */
export const fromLocalDateTimeString = (localDateTime: string): string => {
  return new Date(localDateTime).toISOString();
};

/**
 * Format date in specified format
 * 
 * @param date - Date object, ISO string, or date string to format
 * @param format - Date format (default: 'dd-MM-yyyy')
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date(), 'dd-MM-yyyy') // "11-02-2026"
 * formatDate(new Date(), 'yyyy-MM-dd') // "2026-02-11"
 * formatDate("2026-02-11", 'dd/MM/yyyy') // "11/02/2026"
 */
export const formatDate = (date: Date | string, format: DateFormat = 'dd-MM-yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'dd-MM-yyyy':
      return `${day}-${month}-${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    default:
      return `${day}-${month}-${year}`;
  }
};

/**
 * Format time in specified format
 * 
 * @param date - Date object, ISO string, or time string to format
 * @param format - Time format (default: 'HH:mm')
 * @returns {string} Formatted time string
 * @example
 * formatTime(new Date(), 'HH:mm') // "14:30"
 * formatTime(new Date(), 'HH:mm:ss') // "14:30:45"
 * formatTime(new Date(), 'hh:mm A') // "02:30 PM"
 */
export const formatTime = (date: Date | string, format: TimeFormat = 'HH:mm'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const hours24 = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'HH:mm':
      return `${String(hours24).padStart(2, '0')}:${minutes}`;
    case 'HH:mm:ss':
      return `${String(hours24).padStart(2, '0')}:${minutes}:${seconds}`;
    case 'hh:mm A':
    case 'hh:mm:ss A': {
      const hours12 = hours24 % 12 || 12;
      const period = hours24 >= 12 ? 'PM' : 'AM';
      const timeStr = `${String(hours12).padStart(2, '0')}:${minutes}`;
      return format === 'hh:mm A' ? `${timeStr} ${period}` : `${timeStr}:${seconds} ${period}`;
    }
    default:
      return `${String(hours24).padStart(2, '0')}:${minutes}`;
  }
};

/**
 * Format Date object for display (human-readable)
 * Combines date and time formatting
 * 
 * @param date - Date to format (Date object or ISO string)
 * @param includeSeconds - Include seconds in output
 * @returns {string} Formatted datetime string
 * @example
 * formatDateTime(new Date()) // "2026-02-11 14:30"
 * formatDateTime(new Date(), true) // "2026-02-11 14:30:45"
 * formatDateTime("2026-02-11T13:30:00Z") // "2026-02-11 14:30"
 */
export const formatDateTime = (date: Date | string, includeSeconds: boolean = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  let formatted = `${year}-${month}-${day} ${hours}:${minutes}`;
  
  if (includeSeconds) {
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    formatted += `:${seconds}`;
  }
  
  return formatted;
};

/**
 * Format Date object as ISO string with local date and time
 * 
 * @param date - Date object or ISO string
 * @returns {string} ISO-like string with local time (YYYY-MM-DDTHH:mm:ss)
 * @example
 * formatDateTimeISO(new Date()) // "2026-02-11T14:30:45"
 */
export const formatDateTimeISO = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Parse date string to Date object
 * Handles multiple input formats consistently
 * 
 * @param dateString - Date string in various formats
 * @returns {Date} Parsed Date object
 * @example
 * parseDate("2026-02-11") // Date object
 * parseDate("11-02-2026") // Date object
 * parseDate("02/11/2026") // Date object
 */
export const parseDate = (dateString: string): Date => {
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return new Date(dateString);
  }
  
  // Try dd-MM-yyyy format
  if (/^\d{2}-\d{2}-\d{4}/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`);
  }
  
  // Try dd/MM/yyyy or MM/dd/yyyy format
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
    const parts = dateString.split('/');
    // Assume dd/MM/yyyy for European format
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  
  // Fallback to default parsing
  return new Date(dateString);
};

/**
 * Get today's date in specified format
 * 
 * @param format - Date format (default: 'yyyy-MM-dd')
 * @returns {string} Today's date formatted
 * @example
 * getToday() // "2026-02-11"
 * getToday('dd-MM-yyyy') // "11-02-2026"
 */
export const getToday = (format: DateFormat = 'yyyy-MM-dd'): string => {
  return formatDate(new Date(), format);
};

/**
 * Format slot time range for display
 * 
 * @param startTime - Start time string (HH:mm:ss or HH:mm)
 * @param endTime - End time string (HH:mm:ss or HH:mm)
 * @returns {string} Formatted time range
 * @example
 * formatSlotTimeRange("08:00:00", "10:00:00") // "08:00 - 10:00"
 * formatSlotTimeRange("14:30", "16:30") // "14:30 - 16:30"
 */
export const formatSlotTimeRange = (startTime: string, endTime: string): string => {
  const formatTimeString = (time: string): string => {
    return time.substring(0, 5); // Extract HH:mm from HH:mm:ss or HH:mm
  };
  
  return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
};
