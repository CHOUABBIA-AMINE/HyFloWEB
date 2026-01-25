/**
 * Formatting Utilities - Flow Core Module
 * 
 * Helper functions for formatting flow data for display.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

/**
 * Format date to localized string
 */
export function formatDate(date?: string | Date | null): string {
  if (!date) return 'N/A';
  return dayjs(date).format('DD/MM/YYYY');
}

/**
 * Format date and time to localized string
 */
export function formatDateTime(dateTime?: string | Date | null): string {
  if (!dateTime) return 'N/A';
  return dayjs(dateTime).format('DD/MM/YYYY HH:mm');
}

/**
 * Format date and time with seconds
 */
export function formatDateTimeWithSeconds(dateTime?: string | Date | null): string {
  if (!dateTime) return 'N/A';
  return dayjs(dateTime).format('DD/MM/YYYY HH:mm:ss');
}

/**
 * Format time only
 */
export function formatTime(time?: string | Date | null): string {
  if (!time) return 'N/A';
  return dayjs(time).format('HH:mm');
}

/**
 * Format pressure value
 */
export function formatPressure(pressure?: number | null): string {
  if (pressure === undefined || pressure === null) return 'N/A';
  return `${pressure.toFixed(2)} bar`;
}

/**
 * Format temperature value
 */
export function formatTemperature(temperature?: number | null): string {
  if (temperature === undefined || temperature === null) return 'N/A';
  return `${temperature.toFixed(2)} °C`;
}

/**
 * Format flow rate value
 */
export function formatFlowRate(flowRate?: number | null): string {
  if (flowRate === undefined || flowRate === null) return 'N/A';
  return `${flowRate.toFixed(2)} m³/h`;
}

/**
 * Format volume value
 */
export function formatVolume(volume?: number | null): string {
  if (volume === undefined || volume === null) return 'N/A';
  return `${volume.toFixed(2)} m³`;
}

/**
 * Format percentage value
 */
export function formatPercentage(value?: number | null): string {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(1)}%`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value?: number | null, decimals: number = 2): string {
  if (value === undefined || value === null) return 'N/A';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(milliseconds?: number | null): string {
  if (milliseconds === undefined || milliseconds === null) return 'N/A';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date?: string | Date | null): string {
  if (!date) return 'N/A';
  return dayjs(date).fromNow();
}

/**
 * Format boolean value
 */
export function formatBoolean(value?: boolean | null): string {
  if (value === undefined || value === null) return 'N/A';
  return value ? 'Yes' : 'No';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text?: string | null, maxLength: number = 50): string {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes?: number | null): string {
  if (bytes === undefined || bytes === null) return 'N/A';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
