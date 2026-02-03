/**
 * Slot Coverage DTO - Flow Core Module
 * 
 * Represents the complete coverage view for a specific reading slot.
 * This is the primary DTO for the slot-centric monitoring dashboard.
 * 
 * SONATRACH Workflow:
 * - 1 day = 1 shift
 * - 1 shift = 12 slots
 * - 1 slot = 2 hours
 * - Each pipeline must have exactly 1 reading per slot
 * 
 * Usage:
 * - Slot Dashboard: Filter by Date + Slot + Structure
 * - Shows ALL pipelines with their reading status
 * - Action buttons driven by permission flags from backend RBAC
 * 
 * @author CHOUABBIA Amine
 * @created 02-03-2026
 * @aligned with HyFloAPI slot-centric monitoring process
 */

import type { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import type { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import type { PipelineDTO } from '../../../network/core/dto/PipelineDTO';
import type { FlowReadingDTO } from './FlowReadingDTO';

/**
 * Reading lifecycle status enum
 * Matches backend process workflow
 */
export type ReadingStatus = 
  | 'NOT_RECORDED'      // No reading exists for this slot yet
  | 'DRAFT'            // Operator saved but not submitted
  | 'SUBMITTED'        // Operator submitted for validation
  | 'APPROVED'         // Validator approved
  | 'REJECTED';        // Validator rejected, needs correction

/**
 * Coverage item for a single pipeline within a slot
 * Contains reading data + permission flags for actions
 */
export interface PipelineCoverageItemDTO {
  // Pipeline information
  pipeline: PipelineDTO;
  
  // Current status for this slot
  status: ReadingStatus;
  
  // Reading data (null if NOT_RECORDED)
  reading: FlowReadingDTO | null;
  
  // ========== PERMISSION FLAGS (from backend RBAC) ==========
  // These flags determine which action buttons are enabled
  // NO HARDCODED ROLES IN FRONTEND - backend controls these
  
  /** User can create a new reading (only when NOT_RECORDED) */
  canCreate: boolean;
  
  /** User can edit the reading (only when DRAFT or REJECTED) */
  canEdit: boolean;
  
  /** User can submit the reading for validation (only when DRAFT) */
  canSubmit: boolean;
  
  /** User can approve the reading (validator only, when SUBMITTED) */
  canApprove: boolean;
  
  /** User can reject the reading (validator only, when SUBMITTED) */
  canReject: boolean;
  
  /** User can delete the reading (optional, based on business rules) */
  canDelete?: boolean;
}

/**
 * Summary statistics for slot coverage
 * Displayed in summary cards at top of dashboard
 */
export interface CoverageSummaryDTO {
  /** Total number of pipelines managed by this structure */
  totalPipelines: number;
  
  /** Count of pipelines with no reading yet */
  notRecorded: number;
  
  /** Count of draft readings (not submitted) */
  draft: number;
  
  /** Count of submitted readings awaiting validation */
  submitted: number;
  
  /** Count of approved readings */
  approved: number;
  
  /** Count of rejected readings needing correction */
  rejected: number;
}

/**
 * Main Slot Coverage DTO
 * Response from: GET /flow/core/reading/coverage?date={date}&slotNumber={slot}&structureId={structure}
 */
export interface SlotCoverageDTO {
  /** Business date for this coverage (YYYY-MM-DD) */
  date: string;
  
  /** The reading slot (1-12, with time range) */
  slot: ReadingSlotDTO;
  
  /** The organizational structure (Direction, Department, etc.) */
  structure: StructureDTO;
  
  /** Coverage items for each pipeline managed by this structure */
  pipelineCoverage: PipelineCoverageItemDTO[];
  
  /** Aggregated statistics */
  summary: CoverageSummaryDTO;
  
  /** Optional metadata */
  generatedAt?: string;  // ISO datetime when this coverage was generated
  userRole?: string;     // Current user's role for context
}

/**
 * Helper to calculate completion percentage
 */
export const calculateSlotCompletionPercentage = (summary: CoverageSummaryDTO): number => {
  if (summary.totalPipelines === 0) return 0;
  
  // Consider APPROVED readings as complete
  const completed = summary.approved;
  return Math.round((completed / summary.totalPipelines) * 100);
};

/**
 * Helper to get status color for UI (MUI Chip colors)
 */
export const getReadingStatusColor = (
  status: ReadingStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
  const colorMap: Record<ReadingStatus, ReturnType<typeof getReadingStatusColor>> = {
    NOT_RECORDED: 'default',
    DRAFT: 'info',
    SUBMITTED: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  };
  
  return colorMap[status] || 'default';
};

/**
 * Helper to get status label key for i18n
 */
export const getReadingStatusLabelKey = (status: ReadingStatus): string => {
  const labelMap: Record<ReadingStatus, string> = {
    NOT_RECORDED: 'flow.status.notRecorded',
    DRAFT: 'flow.status.draft',
    SUBMITTED: 'flow.status.submitted',
    APPROVED: 'flow.status.approved',
    REJECTED: 'flow.status.rejected',
  };
  
  return labelMap[status] || 'flow.status.unknown';
};

/**
 * Helper to check if slot is complete (all readings approved)
 */
export const isSlotComplete = (summary: CoverageSummaryDTO): boolean => {
  return summary.approved === summary.totalPipelines && summary.totalPipelines > 0;
};

/**
 * Helper to check if slot has pending validations
 */
export const hasPendingValidations = (summary: CoverageSummaryDTO): boolean => {
  return summary.submitted > 0;
};

/**
 * Helper to check if slot has issues (rejections or missing)
 */
export const hasSlotIssues = (summary: CoverageSummaryDTO): boolean => {
  return summary.rejected > 0 || summary.notRecorded > 0;
};
