/**
 * PipelineSegment DTO
 * Mirrors backend: dz.mdn.iaas.network.core.dto.PipelineSegmentDTO
 */

import { PipelineDTO } from './PipelineDTO';

export interface PipelineSegmentDTO {
  id: number;
  code: string;

  pipelineId: number;
  pipeline?: PipelineDTO | null;
}
