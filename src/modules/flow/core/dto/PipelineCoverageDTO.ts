/**
 * Pipeline Coverage DTO
 * 
 * Represents a single pipeline's reading status within a slot.
 * Aligned with backend: dz.sh.trc.hyflo.flow.core.dto.PipelineCoverageDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/dto
 */

import { WorkflowStatus } from '../types/WorkflowStatus';

export interface PipelineCoverageDTO {
  // Pipeline identification
  pipelineId: number;
  pipelineCode: string;
  pipelineName: string;
  
  // Reading status
  readingId: number | null;
  workflowStatus: WorkflowStatus;
  workflowStatusDisplay: string;
  
  // Timestamps
  recordedAt: string | null;
  validatedAt: string | null;
  
  // Actor information
  recordedByName: string | null;
  validatedByName: string | null;
  
  // Available actions (populated by frontend based on user role)
  availableActions: string[];
  
  // Permission flags (calculated by frontend)
  canEdit: boolean;
  canSubmit: boolean;
  canValidate: boolean;
  
  // Status flags
  isOverdue: boolean;
}
