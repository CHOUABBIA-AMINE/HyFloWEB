/**
 * DailyTrend DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.DailyTrendDTO
 * 
 * Contains daily summary data for trend charts (last 7/30 days).
 * Used for visualizing historical flow and pressure trends.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface DailyTrendDTO {
  // Date
  date: string; // ISO 8601 date format (YYYY-MM-DD)
  
  // Volume metrics
  totalVolumeTransported?: number; // m³ - actual volume transported
  totalVolumeEstimated?: number; // m³ - estimated/target volume
  variance?: number; // m³ - difference (transported - estimated)
  variancePercent?: number; // % - variance as percentage
  
  // Pressure metrics
  averagePressure?: number; // bar - average pressure for the day
  
  // Status
  activePipelines?: number; // count of active pipelines
}

/**
 * Validates DailyTrendDTO according to backend constraints
 */
export const validateDailyTrendDTO = (data: Partial<DailyTrendDTO>): string[] => {
  const errors: string[] = [];
  
  // Date validation (required)
  if (!data.date) {
    errors.push("Date is required");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push("Date must be in YYYY-MM-DD format");
  }
  
  return errors;
};
