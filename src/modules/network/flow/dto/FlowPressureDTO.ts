/**
 * FlowPressure DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.FlowPressureDTO
 * 
 * Represents pressure measurements for pipelines at specific hours.
 * Pressure is measured every 4 hours (00:00, 04:00, 08:00, 12:00, 16:00, 20:00).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { MeasurementHourDTO } from './MeasurementHourDTO';
import { PipelineDTO } from '../../core/dto/PipelineDTO';

export interface FlowPressureDTO {
  // Identifier
  id?: number;
  
  // Measurement data
  pressure: number; // @NotBlank - bar (required)
  measurementDate?: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Required relationships (IDs)
  measurementHourId: number; // @NotNull (required)
  pipelineId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  measurementHour?: MeasurementHourDTO;
  pipeline?: PipelineDTO;
}

/**
 * Validates FlowPressureDTO according to backend constraints
 */
export const validateFlowPressureDTO = (data: Partial<FlowPressureDTO>): string[] => {
  const errors: string[] = [];
  
  // Pressure validation (required)
  if (data.pressure === undefined || data.pressure === null) {
    errors.push("Pressure is required");
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
