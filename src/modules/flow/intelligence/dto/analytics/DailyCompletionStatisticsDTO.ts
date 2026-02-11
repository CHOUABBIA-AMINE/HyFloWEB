/**
 * Daily Completion Statistics DTO - Flow Intelligence Module
 * 
 * Provides daily slot completion metrics for operational monitoring.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.analytics.DailyCompletionStatisticsDTO
 * 
 * Backend endpoint: GET /flow/monitoring/daily-statistics
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/analytics
 */

export interface DailyCompletionStatisticsDTO {
  /**
   * Business date (YYYY-MM-DD)
   * Backend: LocalDate
   * @example "2026-02-07"
   */
  date: string;
  
  /**
   * Total number of pipelines in the structure
   * Backend: Long
   * @example 50
   */
  totalPipelines: number;
  
  /**
   * Number of readings recorded (any status)
   * Backend: Long
   * @example 45
   */
  recordedCount: number;
  
  /**
   * Number of readings submitted for validation
   * Backend: Long
   * @example 40
   */
  submittedCount: number;
  
  /**
   * Number of readings approved/validated
   * Backend: Long
   * @example 35
   */
  approvedCount: number;
  
  /**
   * Number of readings rejected
   * Backend: Long
   * @example 3
   */
  rejectedCount: number;
  
  /**
   * Recording completion percentage (recordedCount / totalPipelines * 100)
   * Calculated by backend - do not compute on frontend
   * Backend: Double
   * @example 90.00
   */
  recordingCompletionPercentage: number;
  
  /**
   * Validation completion percentage (approvedCount / submittedCount * 100)
   * Calculated by backend - do not compute on frontend
   * Backend: Double
   * @example 76.00
   */
  validationCompletionPercentage: number;
}

/**
 * Request parameters for daily completion statistics
 */
export interface DailyCompletionStatisticsRequest {
  /**
   * Structure ID for filtering
   */
  structureId: number;
  
  /**
   * Start date (YYYY-MM-DD)
   */
  startDate: string;
  
  /**
   * End date (YYYY-MM-DD)
   */
  endDate: string;
}

/**
 * Validate request parameters
 */
export const validateDailyCompletionRequest = (
  request: DailyCompletionStatisticsRequest
): string[] => {
  const errors: string[] = [];
  
  if (!request.structureId) {
    errors.push('Structure ID is required');
  }
  
  if (!request.startDate) {
    errors.push('Start date is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(request.startDate)) {
    errors.push('Start date must be in YYYY-MM-DD format');
  }
  
  if (!request.endDate) {
    errors.push('End date is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(request.endDate)) {
    errors.push('End date must be in YYYY-MM-DD format');
  }
  
  if (request.startDate && request.endDate) {
    if (new Date(request.startDate) > new Date(request.endDate)) {
      errors.push('Start date cannot be after end date');
    }
  }
  
  return errors;
};
