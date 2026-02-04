/**
 * Slot Coverage Response DTO
 * 
 * Complete slot coverage information with all pipelines.
 * Aligned with backend: dz.sh.trc.hyflo.flow.core.dto.SlotCoverageResponseDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/dto
 */

import { ReadingSlotDTO } from './ReadingSlotDTO';
import { StructureDTO } from '@/modules/general/organization/dto/StructureDTO';
import { PipelineCoverageDTO } from './PipelineCoverageDTO';

export interface SlotCoverageResponseDTO {
  // Context
  readingDate: string;
  slot: ReadingSlotDTO;
  structure: StructureDTO;
  
  // Summary counts
  totalPipelines: number;
  recordedCount: number;
  submittedCount: number;
  approvedCount: number;
  rejectedCount: number;
  missingCount: number;
  
  // Completion metrics
  completionPercentage: number;
  isSlotComplete: boolean;
  
  // Pipeline details
  pipelines: PipelineCoverageDTO[];
}
