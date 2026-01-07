/**
 * Formatter Utilities - Network Core Module
 * 
 * Formatting functions specific to Network Core entities.
 * Extends common formatters with domain-specific formatting.
 * 
 * @author CHOUABBIA Amine
 */

import {
  formatNumber,
  formatDate,
  formatDateTime,
} from '../../common/utils/formatters';

/**
 * Format diameter value with unit (inches)
 */
export const formatDiameter = (
  diameter: number | undefined | null
): string => {
  if (diameter === undefined || diameter === null) return '-';
  return `${formatNumber(diameter, 2)}"`;  // inches
};

/**
 * Format length value with unit (km or m)
 */
export const formatLength = (
  length: number | undefined | null,
  unit: 'km' | 'm' = 'km'
): string => {
  if (length === undefined || length === null) return '-';
  return `${formatNumber(length, 2)} ${unit}`;
};

/**
 * Format pressure value with unit (bar or psi)
 */
export const formatPressure = (
  pressure: number | undefined | null,
  unit: 'bar' | 'psi' = 'bar'
): string => {
  if (pressure === undefined || pressure === null) return '-';
  return `${formatNumber(pressure, 2)} ${unit}`;
};

/**
 * Format capacity value with unit
 */
export const formatCapacity = (
  capacity: number | undefined | null,
  unit: string = 'm³/day'
): string => {
  if (capacity === undefined || capacity === null) return '-';
  return `${formatNumber(capacity, 0)} ${unit}`;
};

/**
 * Format volume value with unit
 */
export const formatVolume = (
  volume: number | undefined | null,
  unit: string = 'm³'
): string => {
  if (volume === undefined || volume === null) return '-';
  return `${formatNumber(volume, 2)} ${unit}`;
};

/**
 * Format flow rate with unit
 */
export const formatFlowRate = (
  flowRate: number | undefined | null,
  unit: string = 'm³/h'
): string => {
  if (flowRate === undefined || flowRate === null) return '-';
  return `${formatNumber(flowRate, 2)} ${unit}`;
};

/**
 * Format temperature with unit (°C or °F)
 */
export const formatTemperature = (
  temperature: number | undefined | null,
  unit: '°C' | '°F' = '°C'
): string => {
  if (temperature === undefined || temperature === null) return '-';
  return `${formatNumber(temperature, 1)} ${unit}`;
};

/**
 * Format coordinates (latitude, longitude)
 */
export const formatCoordinates = (
  latitude: number | undefined | null,
  longitude: number | undefined | null
): string => {
  if (latitude === undefined || latitude === null || 
      longitude === undefined || longitude === null) {
    return '-';
  }
  
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(latitude).toFixed(6)}° ${latDir}, ${Math.abs(longitude).toFixed(6)}° ${lonDir}`;
};

/**
 * Format installation year
 */
export const formatYear = (year: number | undefined | null): string => {
  if (year === undefined || year === null) return '-';
  return year.toString();
};

/**
 * Format operational status with badge
 */
export const formatOperationalStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: '🟢 Active',
    INACTIVE: '🔴 Inactive',
    MAINTENANCE: '🟡 Maintenance',
    UNDER_CONSTRUCTION: '🟠 Under Construction',
  };
  
  return statusMap[status] || status;
};

// Re-export common formatters
export { formatNumber, formatDate, formatDateTime };
