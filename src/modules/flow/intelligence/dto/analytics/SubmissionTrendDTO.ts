/**
 * Submission Trend DTO - Flow Intelligence Module
 * 
 * Time-series submission statistics for trend analysis.
 * Backend uses native SQL with DATE_FORMAT for aggregation.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.analytics.SubmissionTrendDTO
 * 
 * Backend endpoint: GET /flow/monitoring/submission-trends
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/analytics
 */

export interface SubmissionTrendDTO {
  /**
   * Time period label
   * Format depends on aggregation type:
   * - HOUR: "2026-02-11 14:00"
   * - DAY: "2026-02-11"
   * - WEEK: "2026-W06"
   * - MONTH: "2026-02"
   * Backend: String (from DATE_FORMAT)
   */
  period: string;
  
  /**
   * Number of readings submitted in this period
   * Backend: Integer
   */
  submittedCount: number;
  
  /**
   * Number of readings validated in this period
   * Backend: Integer
   */
  validatedCount: number;
  
  /**
   * Number of readings rejected in this period
   * Backend: Integer
   */
  rejectedCount: number;
  
  /**
   * Validation rate (validatedCount / submittedCount * 100)
   * Calculated by backend - do not compute on frontend
   * Backend: BigDecimal
   * @example 92.50
   */
  validationRate: number;
}

/**
 * Request parameters for submission trends
 */
export interface SubmissionTrendRequest {
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
  
  /**
   * Aggregation type
   * - HOUR: Group by hour
   * - DAY: Group by day
   * - WEEK: Group by week
   * - MONTH: Group by month
   */
  groupBy: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
}
