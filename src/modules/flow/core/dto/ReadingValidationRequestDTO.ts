/**
 * Reading Validation Request DTO
 * 
 * Workflow command for validating (approving/rejecting) flow readings.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.ReadingValidationRequestDTO
 * 
 * PATTERN: Dual representation (ID + nested DTO)
 * - readingId: Used by backend to fetch and lock the reading
 * - reading: Optional, populated by backend for confirmation display
 * - employeeId: Used by backend for audit trail
 * - employee: Populated by backend for validator info display
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Aligned with backend nested DTO pattern
 * @package flow/core/dto
 */

import { FlowReadingDTO } from './FlowReadingDTO';
import { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

export interface ReadingValidationRequestDTO {
  // ========== READING CONTEXT (ID + nested DTO) ==========
  
  /** Flow reading ID to validate (required) */
  readingId: number;
  
  /** Flow reading details (for confirmation/display purposes) */
  reading?: FlowReadingDTO;
  
  // ========== VALIDATION ACTION ==========
  
  /** Validation action: "APPROVE" or "REJECT" (required) */
  action: 'APPROVE' | 'REJECT';
  
  // ========== VALIDATOR CONTEXT (ID + nested DTO) ==========
  
  /** Employee performing validation (required) */
  employeeId: number;
  
  /** Validator details (name, role) */
  employee?: EmployeeDTO;
  
  // ========== COMMENTS ==========
  
  /** Validation comments (required for REJECT, max 500 chars) */
  comments?: string;
}
