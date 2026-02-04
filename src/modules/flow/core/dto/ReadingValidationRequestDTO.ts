/**
 * Reading Validation Request DTO
 * 
 * Request payload for approving or rejecting a reading.
 * Aligned with backend: dz.sh.trc.hyflo.flow.core.dto.ReadingValidationRequestDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/dto
 */

export interface ReadingValidationRequestDTO {
  // Reading to validate
  readingId: number;
  
  // Action to perform
  action: 'APPROVE' | 'REJECT';
  
  // Validator information
  employeeId: number;
  
  // Rejection reason (required if action is REJECT)
  comments?: string;
}
