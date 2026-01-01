/**
 * Dashboard Utility Functions
 * 
 * Formatting and helper functions for dashboard
 */

export const formatNumber = (num: number | null | undefined, decimals: number = 2): string => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatVolume = (volume: number | null | undefined): string => {
  if (volume === null || volume === undefined) return '-';
  return `${formatNumber(volume, 0)} m³`;
};

export const formatPressure = (pressure: number | null | undefined): string => {
  if (pressure === null || pressure === undefined) return '-';
  return `${formatNumber(pressure, 1)} bar`;
};

export const formatPercentage = (percent: number | null | undefined): string => {
  if (percent === null || percent === undefined) return '-';
  return `${formatNumber(percent, 2)}%`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timeString: string | null): string => {
  if (!timeString) return '-';
  return timeString;
};

export const getVolumeStatusColor = (status: string): string => {
  switch (status) {
    case 'ON_TARGET':
      return '#4caf50'; // green
    case 'BELOW_TARGET':
      return '#f44336'; // red
    case 'ABOVE_TARGET':
      return '#ff9800'; // orange
    case 'OFFLINE':
      return '#9e9e9e'; // gray
    default:
      return '#9e9e9e';
  }
};

export const getPressureStatusColor = (status: string): string => {
  switch (status) {
    case 'NORMAL':
      return '#4caf50'; // green
    case 'LOW':
      return '#2196f3'; // blue
    case 'HIGH':
      return '#f44336'; // red
    case 'OFFLINE':
      return '#9e9e9e'; // gray
    default:
      return '#9e9e9e';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'ON_TARGET':
      return 'On Target';
    case 'BELOW_TARGET':
      return 'Below Target';
    case 'ABOVE_TARGET':
      return 'Above Target';
    case 'OFFLINE':
      return 'Offline';
    case 'NORMAL':
      return 'Normal';
    case 'LOW':
      return 'Low';
    case 'HIGH':
      return 'High';
    default:
      return status;
  }
};
