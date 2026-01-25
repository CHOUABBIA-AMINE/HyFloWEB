/**
 * Flow Operation DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowOperationDTO
 * Updated: 01-25-2026 - Aligned with backend using FacilityDTO template
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
  date: string; // @NotNull, @PastOrPresent, LocalDate (ISO format: YYYY-MM-DD) (required)
  volume: number; // @NotNull, @DecimalMin(0.0), @Digits(integer=13, fraction=2) (required)
  validatedAt?: string; // @PastOrPresent, LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  notes?: string; // Max 500 chars
  
  // Required relationships (IDs)
  infrastructureId: number; // @NotNull (required)
  productId: number; // @NotNull (required)
  typeId: number; // @NotNull (required) - Operation type
  recordedById: number; // @NotNull (required)
  validationStatusId: number; // @NotNull (required)
  
  // Optional relationship (ID)
  validatedById?: number;
  
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
  
  // Date validation
  if (!data.date) {
    errors.push('Operation date is required');
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
    const operationDate = new Date(data.date);
    if (operationDate > new Date()) {
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
