/**
 * Slot Coverage Request DTO
 * 
 * Request payload for slot coverage API.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.SlotCoverageRequestDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/dto
 */

export interface SlotCoverageRequestDTO {
  /** Date for readings (YYYY-MM-DD format, required) */
  readingDate: string;
  
  /** Slot identifier (required) */
  slotId: number;
  
  /** Structure identifier (required) */
  structureId: number;
}
