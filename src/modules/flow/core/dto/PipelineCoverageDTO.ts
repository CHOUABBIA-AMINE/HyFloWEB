/**
 * Pipeline Coverage DTO
 * 
 * View model representing per-pipeline coverage status within a slot.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.PipelineCoverageDTO
 * 
 * PATTERN: Uses nested DTOs for all related entities
 * - Eliminates denormalized fields (pipelineCode, pipelineName strings)
 * - Provides full objects with translations
 * - Enables frontend to navigate/link to related entities
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Aligned with backend nested DTO pattern
 * @package flow/core/dto
 */

import { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

export interface PipelineCoverageDTO {
  // ========== PIPELINE CONTEXT (ID + nested DTO) ==========
  
  /** Pipeline ID */
  pipelineId: number;
  
  /** Pipeline details (code, name, type, translations) */
  pipeline?: PipelineDTO;
  
  // ========== READING CONTEXT (ID + nested DTO) ==========
  
  /** Flow reading ID (null if NOT_RECORDED) */
  readingId: number | null;
  
  /** Validation status details (code, translations) */
  validationStatus?: ValidationStatusDTO;
  
  // ========== TIMESTAMPS ==========
  
  /** When reading was recorded (ISO 8601) */
  recordedAt: string | null;
  
  /** When reading was validated (ISO 8601) */
  validatedAt: string | null;
  
  // ========== ACTOR CONTEXT (nested DTOs) ==========
  
  /** Employee who recorded the reading */
  recordedBy?: EmployeeDTO;
  
  /** Employee who validated the reading */
  validatedBy?: EmployeeDTO;
  
  // ========== WORKFLOW STATE ==========
  
  /** Available workflow actions for current user (e.g., ["EDIT", "SUBMIT"]) */
  availableActions?: string[];
  
  /** Can current user edit this reading */
  canEdit?: boolean;
  
  /** Can current user submit this reading */
  canSubmit?: boolean;
  
  /** Can current user validate this reading */
  canValidate?: boolean;
  
  /** Is this reading overdue for the slot deadline */
  isOverdue?: boolean;
}
