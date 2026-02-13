/**
 * Slot Coverage DTO
 * 
 * Data structure for tracking reading coverage by slot and pipeline.
 * Used for monitoring dashboard and workflow tracking.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-13
 * @package flow/core/dto
 */

import { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import { FlowReadingDTO } from './FlowReadingDTO';
import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

/**
 * Pipeline coverage item - status of a single pipeline for a specific slot
 */
export interface PipelineCoverageItemDTO {
  /** Pipeline ID */
  pipelineId: number;
  
  /** Pipeline details (code, name, etc.) */
  pipeline?: PipelineDTO;
  
  /** Workflow status: NOT_RECORDED, DRAFT, SUBMITTED, APPROVED, REJECTED */
  status: 'NOT_RECORDED' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  
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
}

/**
 * Coverage summary statistics
 */
export interface CoverageSummary {
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
  
  /** Reading slot ID */
  slotId: number;
  
  /** Pipeline coverage items */
  pipelines: PipelineCoverageItemDTO[];
  
  /** Coverage summary statistics */
  summary: CoverageSummary;
}
