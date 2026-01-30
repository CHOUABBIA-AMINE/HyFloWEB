/**
 * Flow Forecast DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowForecastDTO
 * Updated: 01-30-2026 - Fully aligned with backend Java DTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { ProductDTO } from '../../../network/common/dto/ProductDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';
import { OperationTypeDTO } from '../../type/dto/OperationTypeDTO';

export interface FlowForecastDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Forecast data
  forecastDate: string; // LocalDate (ISO format: YYYY-MM-DD) (required, @Future)
  predictedVolume: number; // (required, >= 0, max 13 integer + 2 decimal digits)
  adjustedVolume?: number; // Adjusted forecast after expert review (>= 0)
  actualVolume?: number; // Actual volume recorded after forecast date (>= 0)
  accuracy?: number; // Forecast accuracy percentage (0-100%, max 3 integer + 4 decimal digits)
  adjustmentNotes?: string; // Notes explaining forecast adjustments (max 500 chars)
  
  // Required relationships (IDs)
  infrastructureId: number; // (required)
  productId: number; // (required)
  operationTypeId: number; // (required)
  
  // Optional relationship (ID)
  supervisorId?: number; // Supervisor employee ID
  
  // Nested objects (populated in responses)
  infrastructure?: InfrastructureDTO;
  product?: ProductDTO;
  operationType?: OperationTypeDTO;
  supervisor?: EmployeeDTO;
}

/**
 * Validates FlowForecastDTO according to backend constraints
 * @param data - Partial flow forecast data to validate
 * @returns Array of validation error messages
 */
export const validateFlowForecastDTO = (data: Partial<FlowForecastDTO>): string[] => {
  const errors: string[] = [];
  
  // Forecast date validation
  if (!data.forecastDate) {
    errors.push('Forecast date is required');
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.forecastDate)) {
      errors.push('Forecast date must be in YYYY-MM-DD format');
    }
    const forecastDate = new Date(data.forecastDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (forecastDate <= today) {
      errors.push('Forecast date must be in the future');
    }
  }
  
  // Predicted volume validation
  if (data.predictedVolume === undefined || data.predictedVolume === null) {
    errors.push('Predicted volume is required');
  } else if (data.predictedVolume < 0) {
    errors.push('Predicted volume cannot be negative');
  }
  
  // Adjusted volume validation
  if (data.adjustedVolume !== undefined && data.adjustedVolume !== null && data.adjustedVolume < 0) {
    errors.push('Adjusted volume cannot be negative');
  }
  
  // Actual volume validation
  if (data.actualVolume !== undefined && data.actualVolume !== null && data.actualVolume < 0) {
    errors.push('Actual volume cannot be negative');
  }
  
  // Accuracy validation
  if (data.accuracy !== undefined && data.accuracy !== null) {
    if (data.accuracy < 0 || data.accuracy > 100) {
      errors.push('Accuracy must be between 0 and 100%');
    }
  }
  
  // Adjustment notes validation
  if (data.adjustmentNotes && data.adjustmentNotes.length > 500) {
    errors.push('Adjustment notes must not exceed 500 characters');
  }
  
  // Infrastructure validation
  if (data.infrastructureId === undefined || data.infrastructureId === null) {
    errors.push('Infrastructure is required');
  }
  
  // Product validation
  if (data.productId === undefined || data.productId === null) {
    errors.push('Product is required');
  }
  
  // Operation type validation
  if (data.operationTypeId === undefined || data.operationTypeId === null) {
    errors.push('Operation type is required');
  }
  
  return errors;
};
