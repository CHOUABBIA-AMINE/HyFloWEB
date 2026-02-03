/**
 * Slot Coverage DTOs - Flow Core Module
 * 
 * DTOs for slot-based monitoring and operational console.
 * Supports SONATRACH workflow: 1 day = 1 shift, 12 slots per shift.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-03
 * @module flow/core/dto
 */

import type { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import type { StructureDTO } from '@/modules/general/organization/dto/StructureDTO';
import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import type { FlowReadingDTO } from './FlowReadingDTO';

/**
 * Complete slot coverage response
 * 
 * Primary DTO for operational dashboard.
 * Contains all pipelines managed by a structure for a specific date + slot.
 */
export interface SlotCoverageDTO {
  /** Business date (YYYY-MM-DD) */
  date: string;
  
  /** Slot details (1-12, each 2 hours) */
  slot: ReadingSlotDTO;
  
  /** Structure managing these pipelines */
  structure: StructureDTO;
  
  /** All pipelines with their reading status and permissions */
  pipelineCoverage: PipelineCoverageItemDTO[];
  
  /** Aggregated statistics for the slot */
  summary: CoverageSummaryDTO;
}

/**
 * Individual pipeline coverage item
 * 
 * Represents one pipeline's reading status for a specific slot.
 * Includes permission flags computed by backend RBAC.
 */
export interface PipelineCoverageItemDTO {
  /** Pipeline details */
  pipeline: PipelineDTO;
  
  /** Current reading status for this slot */
  status: ReadingStatus;
  
  /** Reading data (null if NOT_RECORDED) */
  reading: FlowReadingDTO | null;
  
  // ========== Permission Flags (Backend RBAC) ==========
  /** User can create new reading for this pipeline/slot */
  canCreate: boolean;
  
  /** User can edit existing reading (DRAFT or REJECTED only) */
  canEdit: boolean;
  
  /** User can submit reading for validation (DRAFT only) */
  canSubmit: boolean;
  
  /** User can approve reading (SUBMITTED only, validator role) */
  canApprove: boolean;
  
  /** User can reject reading (SUBMITTED only, validator role) */
  canReject: boolean;
  
  /** User can delete reading */
  canDelete: boolean;
}

/**
 * Reading lifecycle status
 * 
 * Workflow: NOT_RECORDED → DRAFT → SUBMITTED → APPROVED | REJECTED
 */
export type ReadingStatus =
  | 'NOT_RECORDED'    // No reading exists for this slot
  | 'DRAFT'           // Reading created but not submitted
  | 'SUBMITTED'       // Submitted for validation
  | 'APPROVED'        // Validated and approved
  | 'REJECTED';       // Rejected by validator (can be edited and resubmitted)

/**
 * Coverage summary statistics
 * 
 * Aggregated counts for quick slot status overview.
 */
export interface CoverageSummaryDTO {
  /** Total pipelines managed by structure */
  totalPipelines: number;
  
  /** Pipelines with no reading for this slot */
  notRecorded: number;
  
  /** Readings in draft status */
  draft: number;
  
  /** Readings awaiting validation */
  submitted: number;
  
  /** Approved readings */
  approved: number;
  
  /** Rejected readings */
  rejected: number;
}

/**
 * Advanced filtering options for slot coverage
 */
export interface SlotCoverageFilters {
  /** Business date (YYYY-MM-DD) - Required */
  date: string;
  
  /** Slot number (1-12) - Required */
  slotNumber: number;
  
  /** Structure ID - Required */
  structureId: number;
  
  // ========== Optional Filters ==========
  /** Filter by product type */
  productId?: number;
  
  /** Filter by reading status */
  status?: ReadingStatus;
  
  /** Filter specific pipeline */
  pipelineId?: number;
  
  /** Filter by operator who recorded */
  operatorId?: number;
  
  /** Only show pipelines with alerts */
  hasAlerts?: boolean;
  
  /** Only show incomplete slots */
  incompleteOnly?: boolean;
}

/**
 * Bulk action result
 * 
 * Response for bulk operations (submit all, approve all, etc.)
 */
export interface BulkActionResult {
  /** Total readings in request */
  totalRequested: number;
  
  /** Successfully processed count */
  successful: number;
  
  /** Failed to process count */
  failed: number;
  
  /** Detailed error information */
  errors: BulkActionError[];
  
  /** IDs of successfully processed readings */
  successfulIds?: number[];
}

/**
 * Individual error in bulk operation
 */
export interface BulkActionError {
  /** Reading ID that failed */
  readingId: number;
  
  /** Error message */
  error: string;
  
  /** Error code (optional) */
  code?: string;
}

/**
 * Daily coverage summary
 * 
 * Summary for all 12 slots of a day.
 * Useful for shift overview dashboards.
 */
export interface DailyCoverageSummaryDTO {
  /** Business date */
  date: string;
  
  /** Structure */
  structure: StructureDTO;
  
  /** Summary for each slot */
  slotSummaries: SlotSummaryItem[];
  
  /** Daily totals */
  dailyTotal: {
    totalSlots: number;           // Always 12
    completedSlots: number;       // Slots with 100% approved
    partialSlots: number;         // Slots with some readings
    emptySlots: number;           // Slots with no readings
    overallCompletionRate: number; // Percentage (0-100)
  };
}

/**
 * Summary for one slot in daily view
 */
export interface SlotSummaryItem {
  slot: ReadingSlotDTO;
  summary: CoverageSummaryDTO;
  completionRate: number;  // Percentage (0-100)
  status: 'complete' | 'partial' | 'empty' | 'pending_validation';
}

/**
 * Slot completion statistics (for analytics/reporting)
 */
export interface SlotCompletionStatsDTO {
  /** Business date */
  date: string;
  
  /** Slot number (1-12) */
  slot: number;
  
  /** Completion rate percentage (0-100) */
  completionRate: number;
  
  /** Total pipelines in structure */
  totalPipelines: number;
  
  /** Pipelines with any reading */
  recordedCount: number;
  
  /** Pipelines with approved readings */
  approvedCount: number;
  
  /** Average time to approval (minutes) */
  avgApprovalTime?: number;
  
  /** Structure */
  structure: StructureDTO;
}

/**
 * Helper type guards
 */
export const isReadingEditable = (status: ReadingStatus): boolean => {
  return status === 'DRAFT' || status === 'REJECTED';
};

export const isReadingSubmittable = (status: ReadingStatus): boolean => {
  return status === 'DRAFT';
};

export const isReadingValidatable = (status: ReadingStatus): boolean => {
  return status === 'SUBMITTED';
};

export const isReadingFinal = (status: ReadingStatus): boolean => {
  return status === 'APPROVED';
};

/**
 * Calculate completion rate from summary
 */
export const calculateCompletionRate = (summary: CoverageSummaryDTO): number => {
  if (summary.totalPipelines === 0) return 0;
  
  // Completed = approved + submitted (submitted counts as "pending but recorded")
  const completed = summary.approved + summary.submitted;
  return Math.round((completed / summary.totalPipelines) * 100);
};

/**
 * Determine slot status from summary
 */
export const getSlotStatus = (
  summary: CoverageSummaryDTO
): 'complete' | 'partial' | 'empty' | 'pending_validation' => {
  if (summary.totalPipelines === 0) return 'empty';
  
  // All approved
  if (summary.approved === summary.totalPipelines) {
    return 'complete';
  }
  
  // Has submitted readings awaiting validation
  if (summary.submitted > 0) {
    return 'pending_validation';
  }
  
  // No readings at all
  if (summary.notRecorded === summary.totalPipelines) {
    return 'empty';
  }
  
  // Some readings exist
  return 'partial';
};
