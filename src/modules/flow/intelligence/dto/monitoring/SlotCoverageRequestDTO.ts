/**
 * Slot Coverage Request DTO - Flow Intelligence Module
 * 
 * Request parameters for slot coverage queries.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.monitoring.SlotCoverageRequestDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/monitoring
 */

export interface SlotCoverageRequestDTO {
  /**
   * Structure ID for filtering pipelines
   * Backend: Long
   */
  structureId: number;
  
  /**
   * Target date for coverage (YYYY-MM-DD)
   * Backend: LocalDate
   * @example "2026-02-11"
   */
  date: string;
  
  /**
   * Optional: Filter by specific pipeline
   * Backend: Long
   */
  pipelineId?: number;
  
  /**
   * Optional: Filter by specific slot (1-12)
   * Backend: Long
   */
  slotId?: number;
  
  /**
   * Include only readings with specific validation status
   * Backend: Long (ValidationStatus ID)
   */
  validationStatusId?: number;
}

/**
 * Validate slot coverage request
 */
export const validateSlotCoverageRequest = (
  request: SlotCoverageRequestDTO
): string[] => {
  const errors: string[] = [];
  
  if (!request.structureId) {
    errors.push('Structure ID is required');
  }
  
  if (!request.date) {
    errors.push('Date is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(request.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }
  
  if (request.slotId !== undefined) {
    if (request.slotId < 1 || request.slotId > 12) {
      errors.push('Slot ID must be between 1 and 12');
    }
  }
  
  return errors;
};
