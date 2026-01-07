/**
 * PipelineStatus DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.PipelineStatusDTO
 * 
 * Contains current status and metrics for a single pipeline.
 * Used for real-time monitoring and status displays.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface PipelineStatusDTO {
  // Pipeline info
  pipelineId?: number;
  pipelineCode?: string;
  pipelineName?: string;
  
  // Latest reading
  measurementDate?: string; // ISO 8601 date (YYYY-MM-DD)
  lastReadingTime?: string; // ISO 8601 time (HH:mm:ss) or simple time (HH:mm)
  lastVolume?: number; // m³ from last 4-hour period
  lastPressure?: number; // bar from last 4-hour period
  
  // Daily accumulated
  dailyVolumeTransported?: number; // m³ - Sum of all readings today
  dailyVolumeEstimated?: number; // m³ - Daily target
  dailyVariance?: number; // m³ - Transported - Estimated
  dailyVariancePercent?: number; // % - (Variance / Estimated) * 100
  dailyProgress?: number; // % - (Transported / Estimated) * 100
  
  // Pressure stats
  averagePressureToday?: number; // bar
  minPressureToday?: number; // bar
  maxPressureToday?: number; // bar
  
  // Status indicators
  volumeStatus?: VolumeStatus; // "ON_TARGET", "BELOW_TARGET", "ABOVE_TARGET", "OFFLINE"
  pressureStatus?: PressureStatus; // "NORMAL", "LOW", "HIGH", "OFFLINE"
  
  // Reading count
  readingsCompletedToday?: number;
  readingsExpectedToday?: number; // Usually 6 (every 4 hours)
}

/**
 * Volume status enumerations
 */
export type VolumeStatus = 'ON_TARGET' | 'BELOW_TARGET' | 'ABOVE_TARGET' | 'OFFLINE';

/**
 * Pressure status enumerations
 */
export type PressureStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'OFFLINE';

/**
 * No validation needed - all fields are optional and for display only
 */
export const validatePipelineStatusDTO = (data: Partial<PipelineStatusDTO>): string[] => {
  return []; // All fields are optional
};

/**
 * Helper function to get status color
 */
export const getVolumeStatusColor = (status?: VolumeStatus): string => {
  switch (status) {
    case 'ON_TARGET': return 'green';
    case 'BELOW_TARGET': return 'orange';
    case 'ABOVE_TARGET': return 'blue';
    case 'OFFLINE': return 'gray';
    default: return 'gray';
  }
};

export const getPressureStatusColor = (status?: PressureStatus): string => {
  switch (status) {
    case 'NORMAL': return 'green';
    case 'LOW': return 'orange';
    case 'HIGH': return 'red';
    case 'OFFLINE': return 'gray';
    default: return 'gray';
  }
};
