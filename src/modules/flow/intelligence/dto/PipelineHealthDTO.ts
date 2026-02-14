/**
 * Pipeline Health DTO
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description Comprehensive health metrics and status indicators.
 *              
 * @sources FlowReading, FlowAlert, FlowEvent, FlowThreshold
 * @backend dz.sh.trc.hyflo.flow.intelligence.dto.PipelineHealthDTO
 */

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
export type MetricStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';

export interface PipelineHealthDTO {
  // Health Indicators
  overallHealth: HealthStatus;
  healthScore: number; // 0-100
  activeAlertsCount: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;

  // Current Readings
  currentPressure?: number;
  currentTemperature?: number;
  currentFlowRate?: number;
  lastReadingTime?: string; // ISO datetime

  // 24-Hour Statistics
  avgPressureLast24h?: number;
  throughputLast24h?: number;

  // Recent Activity
  eventsLast7Days: number;

  // Status Indicators
  pressureStatus: MetricStatus;
  temperatureStatus: MetricStatus;
  flowRateStatus: MetricStatus;

  // Availability Metrics
  availabilityPercent: number;
  sensorOnlinePercent: number;
}
