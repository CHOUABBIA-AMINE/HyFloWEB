/**
 * Validator Workload DTO - Flow Intelligence Module
 * 
 * Provides validator performance and workload distribution metrics.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.analytics.ValidatorWorkloadDTO
 * 
 * Backend endpoint: GET /flow/monitoring/validator-workload
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/analytics
 */

export interface ValidatorWorkloadDTO {
  /**
   * Validator employee ID
   * Backend: Long
   */
  validatorId: number;
  
  /**
   * Validator full name
   * Backend: String (from Employee entity)
   * @example "AHMED Mohamed"
   */
  validatorName: string;
  
  /**
   * Number of readings validated (VALIDATED status)
   * Backend: Integer
   */
  validatedCount: number;
  
  /**
   * Number of readings rejected
   * Backend: Integer
   */
  rejectedCount: number;
  
  /**
   * Number of readings currently pending validation
   * Backend: Integer
   */
  pendingCount: number;
  
  /**
   * Average time to validate a reading (minutes)
   * Calculated by backend: AVG(validatedAt - submittedAt)
   * Backend: BigDecimal
   * @example 12.50 (12 minutes 30 seconds)
   */
  averageValidationTimeMinutes: number;
}

/**
 * Request parameters for validator workload
 */
export interface ValidatorWorkloadRequest {
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
   * Optional: Filter by specific validator
   */
  validatorId?: number;
}
