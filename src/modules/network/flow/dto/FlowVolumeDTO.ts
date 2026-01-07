/**
 * FlowVolume DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.FlowVolumeDTO
 * 
 * Represents volume measurements for pipelines at specific hours.
 * Volume is measured every 4 hours (00:00, 04:00, 08:00, 12:00, 16:00, 20:00).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { MeasurementHourDTO } from './MeasurementHourDTO';
import { PipelineDTO } from '../../core/dto/PipelineDTO';

export interface FlowVolumeDTO {
  // Identifier
  id?: number;
  
  // Measurement data
  volume: number; // @NotBlank - m³ (required)
  measurementDate?: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Required relationships (IDs)
  measurementHourId: number; // @NotNull (required)
  pipelineId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  measurementHour?: MeasurementHourDTO;
  pipeline?: PipelineDTO;
}

/**
 * Validates FlowVolumeDTO according to backend constraints
 */
export const validateFlowVolumeDTO = (data: Partial<FlowVolumeDTO>): string[] => {
  const errors: string[] = [];
  
  // Volume validation (required)
  if (data.volume === undefined || data.volume === null) {
    errors.push("Volume is required");
  }
  
  // Measurement hour validation
  if (data.measurementHourId === undefined || data.measurementHourId === null) {
    errors.push("Measurement hour is required");
  }
  
  // Pipeline validation
  if (data.pipelineId === undefined || data.pipelineId === null) {
    errors.push("Pipeline is required");
  }
  
  // Date validation (optional, but if provided must be valid)
  if (data.measurementDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.measurementDate)) {
    errors.push("Measurement date must be in YYYY-MM-DD format");
  }
  
  return errors;
};
