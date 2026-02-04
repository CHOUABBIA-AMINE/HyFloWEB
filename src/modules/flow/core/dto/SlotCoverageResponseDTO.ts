/**
 * Slot Coverage Response DTO
 * 
 * View model for slot coverage aggregation.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.SlotCoverageResponseDTO
 * 
 * PATTERN: Uses nested DTOs for slot and structure context
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Aligned with backend nested DTO pattern
 * @package flow/core/dto
 */

import { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import { StructureDTO } from '@/modules/general/organization/dto/StructureDTO';
import { PipelineCoverageDTO } from './PipelineCoverageDTO';

export interface SlotCoverageResponseDTO {
  // ========== CONTEXT ==========
  
  /** Reading date (YYYY-MM-DD) */
  readingDate: string;
  
  /** Reading slot details (time range, translations) */
  slot: ReadingSlotDTO;
  
  /** Structure details (station/terminal info, translations) */
  structure: StructureDTO;
  
  // ========== METADATA ==========
  
  /** When this coverage snapshot was generated (ISO 8601) */
  generatedAt?: string;
  
  /** Deadline for this slot (readingDate + slot.endTime, ISO 8601) */
  slotDeadline?: string;
  
  // ========== AGGREGATE STATISTICS ==========
  
  /** Total pipelines in this structure */
  totalPipelines: number;
  
  /** Pipelines with any reading (DRAFT/SUBMITTED/APPROVED/REJECTED) */
  recordedCount: number;
  
  /** Pipelines with submitted readings awaiting validation */
  submittedCount: number;
  
  /** Pipelines with approved readings */
  approvedCount: number;
  
  /** Pipelines with rejected readings */
  rejectedCount: number;
  
  /** Pipelines without any reading */
  missingCount: number;
  
  // ========== COMPLETION METRICS ==========
  
  /** Recording completion percentage (recorded/total) */
  recordingCompletionPercentage?: number;
  
  /** Validation completion percentage ((approved+rejected)/total) */
  validationCompletionPercentage?: number;
  
  /** Is slot fully complete (all pipelines APPROVED) */
  isSlotComplete: boolean;
  
  // ========== DETAIL DATA ==========
  
  /** Per-pipeline coverage details */
  pipelines: PipelineCoverageDTO[];
}
