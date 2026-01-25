/**
 * Flow Operation DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: FlowOperationDTO.java (01-23-2026)
 * 
 * Daily flow operation tracking hydrocarbon movements
 */

import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { ProductDTO } from '../../../network/common/dto/ProductDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';
import { OperationTypeDTO } from '../../type/dto/OperationTypeDTO';

export interface FlowOperationDTO {
  id?: number;
  
  // Operation data
  date: string; // ISO 8601 Date (YYYY-MM-DD), required, past or present
  volume: number; // Required, >= 0, max 13 integer digits, 2 decimal places
  validatedAt?: string; // ISO 8601 DateTime
  notes?: string; // Max 500 characters
  
  // Foreign Keys
  infrastructureId: number; // Required
  productId: number; // Required
  typeId: number; // Required (Operation type)
  recordedById: number; // Required
  validatedById?: number;
  validationStatusId: number; // Required
  
  // Nested objects (for read operations)
  infrastructure?: InfrastructureDTO;
  product?: ProductDTO;
  type?: OperationTypeDTO;
  recordedBy?: EmployeeDTO;
  validatedBy?: EmployeeDTO;
  validationStatus?: ValidationStatusDTO;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create flow operation request DTO
 */
export interface CreateFlowOperationDTO {
  date: string;
  volume: number;
  notes?: string;
  infrastructureId: number;
  productId: number;
  typeId: number;
  recordedById: number;
  validationStatusId: number;
}

/**
 * Update flow operation request DTO
 */
export interface UpdateFlowOperationDTO extends Partial<CreateFlowOperationDTO> {
  validatedAt?: string;
  validatedById?: number;
}
