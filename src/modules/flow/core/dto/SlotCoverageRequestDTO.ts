/**
 * Slot Coverage Request DTO
 * 
 * Request payload for slot coverage API.
 * Aligned with backend: dz.sh.trc.hyflo.flow.core.dto.SlotCoverageRequestDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/dto
 */

export interface SlotCoverageRequestDTO {
  // Date for readings (YYYY-MM-DD format)
  readingDate: string;
  
  // Slot identifier (1-12 for 24h / 2h slots)
  slotId: number;
  
  // Structure identifier
  structureId: number;
}
