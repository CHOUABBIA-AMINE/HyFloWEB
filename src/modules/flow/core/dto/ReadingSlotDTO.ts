/**
 * Reading Slot DTO
 * 
 * Represents a 2-hour time slot for flow readings.
 * Aligned with backend: dz.sh.trc.hyflo.flow.core.dto.ReadingSlotDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/dto
 */

export interface ReadingSlotDTO {
  // Identifier
  id: number;
  
  // Slot information
  slotNumber: number; // 1-12 for 24h divided by 2h
  slotName: string; // e.g., "Slot 1", "Slot 2"
  
  // Time range
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
}
