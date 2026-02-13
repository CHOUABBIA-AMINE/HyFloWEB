/**
 * Slot Coverage DTO
 * 
 * Data structure for tracking reading coverage by slot and pipeline.
 * Used for monitoring dashboard and workflow tracking.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-13
 * @updated 2026-02-13 - Added missing types for service layer
 * @package flow/core/dto
 */

import { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import { StructureDTO } from '@/modules/general/organization/dto/StructureDTO';
import { FlowReadingDTO } from './FlowReadingDTO';
import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

/**
 * Reading workflow status type
 */
export type ReadingStatus = 'NOT_RECORDED' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

/**
 * Pipeline coverage item - status of a single pipeline for a specific slot
 */
export interface PipelineCoverageItemDTO {
  /** Pipeline ID */
  pipelineId: number;
  
  /** Pipeline details (code, name, etc.) */
  pipeline?: PipelineDTO;
  
  /** Workflow status */
  status: ReadingStatus;
  
  /** Reading ID if exists */
  readingId?: number;
  
  /** Reading details (measurements, timestamps) */
  reading?: FlowReadingDTO;
  
  /** Validation status details */
  validationStatus?: ValidationStatusDTO;
  
  /** Employee who recorded the reading */
  recordedBy?: EmployeeDTO;
  
  /** Employee who validated the reading */
  validatedBy?: EmployeeDTO;
  
  /** When reading was recorded */
  recordedAt?: string;
  
  /** When reading was validated */
  validatedAt?: string;
  
  /** Permission flags */
  canCreate?: boolean;
  canEdit?: boolean;
  canSubmit?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
}

/**
 * Coverage summary statistics (renamed from CoverageSummary for consistency)
 */
export interface CoverageSummaryDTO {
  /** Total number of pipelines */
  totalPipelines: number;
  
  /** Number of pipelines not recorded */
  notRecorded: number;
  
  /** Number of draft readings */
  drafts: number;
  
  /** Number of submitted readings (pending validation) */
  submitted: number;
  
  /** Number of approved readings */
  approved: number;
  
  /** Number of rejected readings */
  rejected: number;
}

/**
 * Slot coverage - complete coverage status for a specific date and slot
 */
export interface SlotCoverageDTO {
  /** Date (YYYY-MM-DD) */
  date: string;
  
  /** Reading slot details */
  slot?: ReadingSlotDTO;
  
  /** Reading slot ID */
  slotId?: number;
  
  /** Structure details */
  structure?: StructureDTO;
  
  /** Pipeline coverage items (semantic naming) */
  pipelineCoverage: PipelineCoverageItemDTO[];
  
  /** Coverage summary statistics */
  summary: CoverageSummaryDTO;
  
  /** Generated timestamp */
  generatedAt?: string;
  
  /** Slot deadline timestamp */
  slotDeadline?: string;
  
  /** Is slot complete (all readings approved) */
  isSlotComplete?: boolean;
}

/**
 * Slot coverage filters for advanced querying
 */
export interface SlotCoverageFilters {
  /** Date (YYYY-MM-DD) */
  date: string;
  
  /** Slot number (1-12) */
  slotNumber: number;
  
  /** Structure ID */
  structureId: number;
  
  /** Filter by status */
  status?: ReadingStatus[];
  
  /** Filter by product ID */
  productId?: number;
  
  /** Filter by pipeline code pattern */
  pipelineCode?: string;
  
  /** Include only critical pipelines */
  criticalOnly?: boolean;
}

/**
 * Bulk action result
 */
export interface BulkActionResult {
  /** Total number of readings processed */
  total: number;
  
  /** Number of successful operations */
  success: number;
  
  /** Number of failed operations */
  failed: number;
  
  /** Error messages for failed operations */
  errors?: Array<{
    readingId: number;
    error: string;
  }>;
}

/**
 * Daily coverage summary (all 12 slots for a day)
 */
export interface DailyCoverageSummaryDTO {
  /** Date (YYYY-MM-DD) */
  date: string;
  
  /** Structure details */
  structure?: StructureDTO;
  
  /** Coverage by slot (12 entries) */
  slots: Array<{
    slotNumber: number;
    slot?: ReadingSlotDTO;
    summary: CoverageSummaryDTO;
    completionPercentage: number;
  }>;
  
  /** Overall daily summary */
  dailySummary: CoverageSummaryDTO;
  
  /** Overall completion percentage */
  overallCompletionPercentage: number;
}

/**
 * Slot completion statistics for reporting
 */
export interface SlotCompletionStatsDTO {
  /** Date (YYYY-MM-DD) */
  date: string;
  
  /** Slot number */
  slotNumber: number;
  
  /** Slot details */
  slot?: ReadingSlotDTO;
  
  /** Total pipelines */
  totalPipelines: number;
  
  /** Recording completion rate (%) */
  recordingCompletionRate: number;
  
  /** Validation completion rate (%) */
  validationCompletionRate: number;
  
  /** Average time to submit (minutes) */
  avgTimeToSubmit?: number;
  
  /** Average time to validate (minutes) */
  avgTimeToValidate?: number;
  
  /** Number of rejected readings */
  rejectedCount: number;
}
