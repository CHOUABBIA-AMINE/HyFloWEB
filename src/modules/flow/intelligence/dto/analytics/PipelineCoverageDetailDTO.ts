/**
 * Pipeline Coverage Detail DTO - Flow Intelligence Module
 * 
 * Detailed coverage per pipeline across date range.
 * Backend uses native SQL with CTE + CROSS JOIN for comprehensive coverage.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.analytics.PipelineCoverageDetailDTO
 * 
 * Backend endpoint: GET /flow/monitoring/pipeline-coverage
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/analytics
 */

export interface PipelineCoverageDetailDTO {
  /**
   * Pipeline ID
   * Backend: Long
   */
  pipelineId: number;
  
  /**
   * Pipeline name
   * Backend: String (from Pipeline entity)
   * @example "Main Supply Line A"
   */
  pipelineName: string;
  
  /**
   * Pipeline code
   * Backend: String
   * @example "PIP-001"
   */
  pipelineCode?: string;
  
  /**
   * Total expected readings (days * 12 slots per day)
   * Backend: Integer (calculated)
   * @example 360 (30 days * 12 slots)
   */
  expectedReadings: number;
  
  /**
   * Number of readings actually recorded
   * Backend: Integer
   */
  recordedReadings: number;
  
  /**
   * Number of readings validated
   * Backend: Integer
   */
  validatedReadings: number;
  
  /**
   * Coverage percentage (recordedReadings / expectedReadings * 100)
   * Calculated by backend - do not compute on frontend
   * Backend: BigDecimal
   * @example 87.50
   */
  coveragePercentage: number;
  
  /**
   * Validation percentage (validatedReadings / recordedReadings * 100)
   * Calculated by backend - do not compute on frontend
   * Backend: BigDecimal
   * @example 95.00
   */
  validationPercentage: number;
}

/**
 * Request parameters for pipeline coverage
 */
export interface PipelineCoverageRequest {
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
   * Optional: Filter by specific pipeline
   */
  pipelineId?: number;
}
