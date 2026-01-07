/**
 * FlowTransported DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.FlowTransportedDTO
 * 
 * Represents daily transported vs estimated volumes for pipelines.
 * Used for daily performance tracking and variance analysis.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { PipelineDTO } from '../../core/dto/PipelineDTO';

export interface FlowTransportedDTO {
  // Identifier
  id?: number;
  
  // Volume data
  volumeEstimated: number; // @NotBlank - m³ (required)
  volumeTransported?: number; // m³ - actual transported (optional)
  
  // Date
  measurementDate?: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Required relationships (IDs)
  pipelineId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  pipeline?: PipelineDTO;
}

/**
 * Validates FlowTransportedDTO according to backend constraints
 */
export const validateFlowTransportedDTO = (data: Partial<FlowTransportedDTO>): string[] => {
  const errors: string[] = [];
  
  // Estimated volume validation (required)
  if (data.volumeEstimated === undefined || data.volumeEstimated === null) {
    errors.push("Estimated volume is required");
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
