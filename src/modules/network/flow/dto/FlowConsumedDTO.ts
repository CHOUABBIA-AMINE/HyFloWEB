/**
 * FlowConsumed DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.FlowConsumedDTO
 * 
 * Represents daily consumed vs estimated volumes for terminals.
 * Used for daily consumption tracking and variance analysis at terminal level.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { TerminalDTO } from '../../core/dto/TerminalDTO';

export interface FlowConsumedDTO {
  // Identifier
  id?: number;
  
  // Volume data
  volumeEstimated: number; // @NotBlank - m³ (required)
  volumeConsumed?: number; // m³ - actual consumed (optional)
  
  // Date
  measurementDate?: string; // ISO 8601 date (YYYY-MM-DD)
  
  // Required relationships (IDs)
  terminalId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  terminal?: TerminalDTO;
}

/**
 * Validates FlowConsumedDTO according to backend constraints
 */
export const validateFlowConsumedDTO = (data: Partial<FlowConsumedDTO>): string[] => {
  const errors: string[] = [];
  
  // Estimated volume validation (required)
  if (data.volumeEstimated === undefined || data.volumeEstimated === null) {
    errors.push("Estimated volume is required");
  }
  
  // Terminal validation
  if (data.terminalId === undefined || data.terminalId === null) {
    errors.push("Terminal is required");
  }
  
  // Date validation (optional, but if provided must be valid)
  if (data.measurementDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.measurementDate)) {
    errors.push("Measurement date must be in YYYY-MM-DD format");
  }
  
  return errors;
};
