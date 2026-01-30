/**
 * Flow Operation DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowOperationDTO
 * Updated: 01-30-2026 - Fully aligned with backend Java DTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { ProductDTO } from '../../../network/common/dto/ProductDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';
import { OperationTypeDTO } from '../../type/dto/OperationTypeDTO';

export interface FlowOperationDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Operation data
  operationDate: string; // LocalDate (ISO format: YYYY-MM-DD) (required, @PastOrPresent)
  volume: number; // (required, >= 0, max 13 integer + 2 decimal digits)
  validatedAt?: string; // LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss) (@PastOrPresent)
  notes?: string; // Additional notes (max 500 chars)
  
  // Required relationships (IDs)
  infrastructureId: number; // (required)
  productId: number; // (required)
  typeId: number; // (required) - Operation type ID
  recordedById: number; // (required) - Employee who recorded
  validationStatusId: number; // (required)
  
  // Optional relationship (ID)
  validatedById?: number; // Employee who validated
  
  // Nested objects (populated in responses)
  infrastructure?: InfrastructureDTO;
  product?: ProductDTO;
  type?: OperationTypeDTO;
  recordedBy?: EmployeeDTO;
  validatedBy?: EmployeeDTO;
  validationStatus?: ValidationStatusDTO;
}

/**
 * Validates FlowOperationDTO according to backend constraints
 * @param data - Partial flow operation data to validate
 * @returns Array of validation error messages
 */
export const validateFlowOperationDTO = (data: Partial<FlowOperationDTO>): string[] => {
  const errors: string[] = [];
  
  // Operation date validation
  if (!data.operationDate) {
    errors.push('Operation date is required');
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.operationDate)) {
      errors.push('Operation date must be in YYYY-MM-DD format');
    }
    const operationDate = new Date(data.operationDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (operationDate > today) {
      errors.push('Operation date cannot be in the future');
    }
  }
  
  // Volume validation
  if (data.volume === undefined || data.volume === null) {
    errors.push('Volume is required');
  } else if (data.volume < 0) {
    errors.push('Volume cannot be negative');
  }
  
  // Validated at validation
  if (data.validatedAt) {
    const validatedDate = new Date(data.validatedAt);
    if (validatedDate > new Date()) {
      errors.push('Validation time cannot be in the future');
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
  
  // Operation type validation
  if (data.typeId === undefined || data.typeId === null) {
    errors.push('Operation type is required');
  }
  
  // Recording employee validation
  if (data.recordedById === undefined || data.recordedById === null) {
    errors.push('Recording employee is required');
  }
  
  // Validation status validation
  if (data.validationStatusId === undefined || data.validationStatusId === null) {
    errors.push('Validation status is required');
  }
  
  return errors;
};
