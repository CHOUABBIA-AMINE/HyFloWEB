/**
 * Pipeline Dynamic Dashboard DTO
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description Real-time operational dashboard metrics.
 *              Optimized for frequent updates (30-second cache).
 *              
 * @sources Pipeline, FlowReading, FlowAlert, FlowEvent, FlowThreshold, Sensor
 * @backend dz.sh.trc.hyflo.flow.intelligence.dto.PipelineDynamicDashboardDTO
 */

import { KeyMetricsDTO } from './KeyMetricsDTO';
import { FlowReadingDTO } from '../../core/dto/FlowReadingDTO';

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
export type MetricStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';

export interface PipelineDynamicDashboardDTO {
  // Identification
  pipelineId: number;
  pipelineName: string;

  // Current Reading
  latestReading?: FlowReadingDTO;
  keyMetrics?: KeyMetricsDTO; // Typed metrics instead of Record<string, number>

  // Health Indicators
  overallHealth: HealthStatus;
  healthScore: number; // 0-100
  activeAlertsCount: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;

  // 24-Hour Statistics
  avgPressureLast24h?: number;
  avgTemperatureLast24h?: number;
  avgFlowRateLast24h?: number;
  throughputLast24h?: number;

  // Recent Activity
  eventsLast7Days: number;
  operationsLast7Days: number;

  // Status Indicators
  pressureStatus: MetricStatus;
  temperatureStatus: MetricStatus;
  flowRateStatus: MetricStatus;

  // Sensor Coverage
  sensorOnlinePercent: number;
  onlineSensors: number;
  totalSensors: number;

  // Data Quality
  dataCompletenessPercent: number;
  validatedReadingsToday: number;
  pendingReadingsToday: number;
}
