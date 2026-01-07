/**
 * FlowProduced DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.FlowProducedDTO
 * 
 * Represents daily produced vs estimated volumes for hydrocarbon fields.
 * Used for daily production tracking and variance analysis at field level.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { HydrocarbonFieldDTO } from '../../core/dto/HydrocarbonFieldDTO';

export interface FlowProducedDTO {
  // Identifier
  id?: number;
  
  // Volume data
  volumeEstimated: number; // @NotBlank - m³ (required)
  volumeProduced?: number; // m³ - actual produced (optional)
  
  // Date
  measurementDate?: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Required relationships (IDs)
  hydrocarbonFieldId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  hydrocarbonField?: HydrocarbonFieldDTO;
}

/**
 * Validates FlowProducedDTO according to backend constraints
 */
export const validateFlowProducedDTO = (data: Partial<FlowProducedDTO>): string[] => {
  const errors: string[] = [];
  
  // Estimated volume validation (required)
  if (data.volumeEstimated === undefined || data.volumeEstimated === null) {
    errors.push("Estimated volume is required");
  }
  
  // Hydrocarbon field validation
  if (data.hydrocarbonFieldId === undefined || data.hydrocarbonFieldId === null) {
    errors.push("Hydrocarbon field is required");
  }
  
  // Date validation (optional, but if provided must be valid)
  if (data.measurementDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.measurementDate)) {
    errors.push("Measurement date must be in YYYY-MM-DD format");
  }
  
  return errors;
};
