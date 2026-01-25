/**
 * Formatting Utilities - Flow Core Module
 * 
 * Helper functions for formatting flow measurements and data.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import { MEASUREMENT_UNITS } from './constants';

/**
 * Format pressure with unit
 */
export function formatPressure(pressure: number | null | undefined, decimals: number = 2): string {
  if (pressure === null || pressure === undefined) return 'N/A';
  return `${pressure.toFixed(decimals)} ${MEASUREMENT_UNITS.PRESSURE}`;
}

/**
 * Format temperature with unit
 */
export function formatTemperature(temperature: number | null | undefined, decimals: number = 2): string {
  if (temperature === null || temperature === undefined) return 'N/A';
  return `${temperature.toFixed(decimals)} ${MEASUREMENT_UNITS.TEMPERATURE}`;
}

/**
 * Format flow rate with unit
 */
export function formatFlowRate(flowRate: number | null | undefined, decimals: number = 2): string {
  if (flowRate === null || flowRate === undefined) return 'N/A';
  return `${flowRate.toFixed(decimals)} ${MEASUREMENT_UNITS.FLOW_RATE}`;
}

/**
 * Format volume with unit
 */
export function formatVolume(volume: number | null | undefined, decimals: number = 2): string {
  if (volume === null || volume === undefined) return 'N/A';
  return `${volume.toFixed(decimals)} ${MEASUREMENT_UNITS.VOLUME}`;
}

/**
 * Format large volume with thousands separator
 */
export function formatLargeVolume(volume: number | null | undefined): string {
  if (volume === null || volume === undefined) return 'N/A';
  return `${volume.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${MEASUREMENT_UNITS.VOLUME}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('fr-FR');
}

/**
 * Format duration in hours to human-readable format
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)} h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} j`;
  }
  return `${days} j ${remainingHours.toFixed(0)} h`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format threshold range
 */
export function formatThresholdRange(
  minValue: number | null | undefined,
  maxValue: number | null | undefined,
  unit: string = ''
): string {
  if (minValue === null || minValue === undefined) {
    if (maxValue === null || maxValue === undefined) return 'N/A';
    return `≤ ${maxValue}${unit ? ' ' + unit : ''}`;
  }
  if (maxValue === null || maxValue === undefined) {
    return `≥ ${minValue}${unit ? ' ' + unit : ''}`;
  }
  return `${minValue} - ${maxValue}${unit ? ' ' + unit : ''}`;
}
