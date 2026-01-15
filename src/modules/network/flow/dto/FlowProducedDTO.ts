/**
 * FlowProduced DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.FlowProducedDTO
 * 
 * Represents daily produced vs estimated volumes for production fields.
 * Used for daily production tracking and variance analysis at field level.
 * 
 * Updated: 01-16-2026 - Fixed import to use ProductionFieldDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { ProductionFieldDTO } from '../../core/dto/ProductionFieldDTO';

export interface FlowProducedDTO {
  // Identifier
  id?: number;
  
  // Volume data
  volumeEstimated: number; // @NotBlank - m³ (required)
  volumeProduced?: number; // m³ - actual produced (optional)
  
  // Date
  measurementDate?: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Required relationships (IDs)
  productionFieldId: number; // @NotNull (required) - renamed from hydrocarbonFieldId
  
  // Nested objects (populated in responses)
  productionField?: ProductionFieldDTO; // renamed from hydrocarbonField
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
  
  // Production field validation
  if (data.productionFieldId === undefined || data.productionFieldId === null) {
    errors.push("Production field is required");
  }
  
  // Date validation (optional, but if provided must be valid)
  if (data.measurementDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.measurementDate)) {
    errors.push("Measurement date must be in YYYY-MM-DD format");
  }
  
  return errors;
};
