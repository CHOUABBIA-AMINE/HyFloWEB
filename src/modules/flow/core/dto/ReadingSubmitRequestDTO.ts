/**
 * Reading Submit Request DTO
 * 
 * Request payload for submitting or updating a reading.
 * Aligned with backend: dz.sh.trc.hyflo.flow.core.dto.ReadingSubmitRequestDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/dto
 */

export interface ReadingSubmitRequestDTO {
  // Reading identification
  readingId: number | null; // null for new reading
  
  // Context
  pipelineId: number;
  readingDate: string; // YYYY-MM-DD
  slotId: number;
  employeeId: number;
  
  // Measurement values
  pressure: number; // Required
  temperature: number; // Required
  flowRate: number; // Required
  containedVolume?: number; // Optional
  
  // Additional information
  notes?: string;
  
  // Workflow control
  submitImmediately: boolean; // true = SUBMITTED, false = DRAFT
}
