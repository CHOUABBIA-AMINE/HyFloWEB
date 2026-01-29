/**
 * Utility functions for handling datetime-local input values with timezone support
 * 
 * Datetime-local inputs expect local time in format YYYY-MM-DDTHH:mm
 * These utilities ensure correct timezone handling for Algeria (UTC+1)
 * 
 * @author CHOUABBIA Amine
 * @created 01-29-2026
 */

/**
 * Get current local datetime in format for datetime-local input
 * Accounts for timezone offset to show correct local time
 * 
 * @returns {string} Format: YYYY-MM-DDTHH:mm (local time)
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
 */
export const isoToLocalDateTimeString = (isoString: string): string => {
  return toLocalDateTimeString(new Date(isoString));
};

/**
 * Convert datetime-local input value to UTC ISO string for backend
 * 
 * @param localDateTime - datetime-local value (YYYY-MM-DDTHH:mm)
 * @returns {string} ISO 8601 UTC string
 */
export const fromLocalDateTimeString = (localDateTime: string): string => {
  return new Date(localDateTime).toISOString();
};

/**
 * Format Date object for display (human-readable)
 * 
 * @param date - Date to format
 * @param includeSeconds - Include seconds in output
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date: Date, includeSeconds: boolean = false): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  let formatted = `${year}-${month}-${day} ${hours}:${minutes}`;
  
  if (includeSeconds) {
    const seconds = String(date.getSeconds()).padStart(2, '0');
    formatted += `:${seconds}`;
  }
  
  return formatted;
};
