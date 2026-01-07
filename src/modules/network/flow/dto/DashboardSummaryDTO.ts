/**
 * DashboardSummary DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.DashboardSummaryDTO
 * 
 * Contains aggregated data for dashboard display.
 * Comprehensive summary of infrastructure, daily metrics, and monthly statistics.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface DashboardSummaryDTO {
  // Infrastructure counts
  totalStations?: number;
  totalTerminals?: number;
  totalFields?: number;
  totalPipelines?: number;
  
  // Today's summary
  currentDate?: string; // ISO 8601 date (YYYY-MM-DD)
  totalVolumeToday?: number; // m³
  averagePressureToday?: number; // bar
  activePipelines?: number;
  totalReadingsToday?: number;
  expectedReadingsToday?: number;
  
  // Daily transported vs estimated
  totalTransportedToday?: number; // m³
  totalEstimatedToday?: number; // m³
  varianceToday?: number; // m³
  variancePercentToday?: number; // %
  
  // Status breakdown
  pipelinesOnTarget?: number; // Within ±5%
  pipelinesBelowTarget?: number; // < -5%
  pipelinesAboveTarget?: number; // > +5%
  pipelinesOffline?: number;
  
  // Recent readings
  lastReadingTime?: string; // e.g., "20:00"
  nextReadingTime?: string; // e.g., "00:00"
  
  // Monthly summary
  currentDayOfMonth?: number;
  monthlyTotalTransported?: number; // m³
  monthlyTotalEstimated?: number; // m³
  monthlyVariance?: number; // m³
  monthlyVariancePercent?: number; // %
  daysOnTargetThisMonth?: number;
}

/**
 * No validation needed - all fields are optional and for display only
 */
export const validateDashboardSummaryDTO = (data: Partial<DashboardSummaryDTO>): string[] => {
  return []; // All fields are optional
};
