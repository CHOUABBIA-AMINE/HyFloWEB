/**
 * Slot Coverage Response DTO - Flow Intelligence Module
 * 
 * Response containing slot coverage status and reading details.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.monitoring.SlotCoverageResponseDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/monitoring
 */

import type { FlowReadingDTO } from '../../../core/dto/FlowReadingDTO';
import type { ReadingSlotDTO } from '../../../common/dto/ReadingSlotDTO';

export interface SlotCoverageResponseDTO {
  /**
   * Target date (YYYY-MM-DD)
   * Backend: LocalDate
   */
  date: string;
  
  /**
   * Total pipelines in structure
   * Backend: Integer
   */
  totalPipelines: number;
  
  /**
   * Total expected readings (totalPipelines * 12 slots)
   * Backend: Integer
   */
  totalExpectedReadings: number;
  
  /**
   * Total readings recorded
   * Backend: Integer
   */
  totalRecordedReadings: number;
  
  /**
   * Total readings validated
   * Backend: Integer
   */
  totalValidatedReadings: number;
  
  /**
   * Overall coverage percentage
   * Backend: BigDecimal
   * @example 87.50
   */
  overallCoveragePercentage: number;
  
  /**
   * Coverage details per slot
   * 12 entries (one per slot)
   */
  slotCoverages: SlotCoverageDetail[];
}

/**
 * Coverage detail for a single slot
 */
export interface SlotCoverageDetail {
  /**
   * Slot information
   */
  slot: ReadingSlotDTO;
  
  /**
   * Expected readings for this slot (= totalPipelines)
   * Backend: Integer
   */
  expectedReadings: number;
  
  /**
   * Recorded readings for this slot
   * Backend: Integer
   */
  recordedReadings: number;
  
  /**
   * Validated readings for this slot
   * Backend: Integer
   */
  validatedReadings: number;
  
  /**
   * Coverage percentage for this slot
   * Backend: BigDecimal
   * @example 92.00
   */
  coveragePercentage: number;
  
  /**
   * Missing pipelines (those without readings for this slot)
   * Backend: List<Pipeline>
   */
  missingPipelines?: MissingPipelineInfo[];
}

/**
 * Information about a missing pipeline reading
 */
export interface MissingPipelineInfo {
  /**
   * Pipeline ID
   */
  pipelineId: number;
  
  /**
   * Pipeline code
   * @example "PIP-003"
   */
  pipelineCode: string;
  
  /**
   * Pipeline name
   * @example "Secondary Line C"
   */
  pipelineName: string;
}

/**
 * Get coverage status color for UI
 */
export const getCoverageStatusColor = (
  percentage: number
): 'success' | 'warning' | 'error' => {
  if (percentage >= 90) return 'success';
  if (percentage >= 70) return 'warning';
  return 'error';
};
