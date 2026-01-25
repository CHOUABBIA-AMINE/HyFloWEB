/**
 * Flow Forecast DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowForecastDTO
 * Updated: 01-25-2026 - Aligned with backend using FacilityDTO template
 * 
 * Backend file needs to be checked - creating based on original requirements
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { ProductDTO } from '../../../network/common/dto/ProductDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';

export interface FlowForecastDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Forecast data
  forecastDate: string; // LocalDate (ISO format: YYYY-MM-DD) (required, future date)
  estimatedVolume: number; // (required, >= 0)
  confidence?: number; // Confidence percentage (0-100)
  validatedAt?: string; // LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  notes?: string; // Max 500 chars
  
  // Required relationships (IDs)
  infrastructureId: number; // (required)
  productId: number; // (required)
  createdById: number; // (required)
  validationStatusId: number; // (required)
  
  // Optional relationship (ID)
  validatedById?: number;
  
  // Nested objects (populated in responses)
  infrastructure?: InfrastructureDTO;
  product?: ProductDTO;
  createdBy?: EmployeeDTO;
  validatedBy?: EmployeeDTO;
  validationStatus?: ValidationStatusDTO;
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
    if (forecastDate <= new Date()) {
      errors.push('Forecast date must be in the future');
    }
  }
  
  // Estimated volume validation
  if (data.estimatedVolume === undefined || data.estimatedVolume === null) {
    errors.push('Estimated volume is required');
  } else if (data.estimatedVolume < 0) {
    errors.push('Estimated volume cannot be negative');
  }
  
  // Confidence validation
  if (data.confidence !== undefined && data.confidence !== null) {
    if (data.confidence < 0 || data.confidence > 100) {
      errors.push('Confidence must be between 0 and 100');
    }
  }
  
  // Notes validation
  if (data.notes && data.notes.length > 500) {
    errors.push('Notes must not exceed 500 characters');
  }
  
  // Infrastructure validation
  if (data.infrastructureId === undefined || data.infrastructureId === null) {
    errors.push('Infrastructure is required');
  }
  
  // Product validation
  if (data.productId === undefined || data.productId === null) {
    errors.push('Product is required');
  }
  
  // Created by validation
  if (data.createdById === undefined || data.createdById === null) {
    errors.push('Created by employee is required');
  }
  
  // Validation status validation
  if (data.validationStatusId === undefined || data.validationStatusId === null) {
    errors.push('Validation status is required');
  }
  
  return errors;
};
