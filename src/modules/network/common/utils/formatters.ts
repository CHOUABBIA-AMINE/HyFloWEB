/**
 * Formatter Utilities - Network Common Module
 * 
 * Common formatting functions for Network Common entities.
 * Provides consistent data formatting across the application.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * Format a number with thousand separators
 */
export const formatNumber = (
  value: number | undefined | null,
  decimals: number = 0
): string => {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a number as currency
 */
export const formatCurrency = (
  value: number | undefined | null,
  currency: string = 'USD'
): string => {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency,
  });
};

/**
 * Format a number as percentage
 */
export const formatPercentage = (
  value: number | undefined | null,
  decimals: number = 2
): string => {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Format a date to local date string
 */
export const formatDateLocal = (
  date: Date | string | undefined | null,
  locale: string = 'en-US'
): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
};

/**
 * Format a date to datetime string
 */
export const formatDateTime = (
  date: Date | string | undefined | null,
  locale: string = 'en-US'
): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale);
};

/**
 * Format a string to title case
 */
export const toTitleCase = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format a string to uppercase
 */
export const toUpperCase = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.toUpperCase();
};

/**
 * Format a string to lowercase
 */
export const toLowerCase = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.toLowerCase();
};

/**
 * Truncate a string to a maximum length
 */
export const truncate = (
  str: string | undefined | null,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format a file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number | undefined | null): string => {
  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format a phone number
 */
export const formatPhone = (phone: string | undefined | null): string => {
  if (!phone) return '-';
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};
