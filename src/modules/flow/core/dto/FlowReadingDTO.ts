/**
 * Flow Reading DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: FlowReadingDTO.java (01-23-2026)
 * 
 * Flow measurement reading capturing pipeline operational parameters
 */

import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { PipelineDTO } from '../../../network/core/dto/PipelineDTO';

export interface FlowReadingDTO {
  id?: number;
  
  // Measurement data
  recordedAt: string; // ISO 8601 DateTime (required, past or present)
  pressure?: number;  // Bar (0-500), 2 decimals
  temperature?: number; // Celsius (-50 to 200), 2 decimals
  flowRate?: number;  // m³/h, positive
  containedVolume?: number; // m³, positive
  
  // Validation tracking
  validatedAt?: string; // ISO 8601 DateTime
  notes?: string; // Max 500 characters
  
  // Foreign Keys
  recordedById: number; // Required
  validatedById?: number;
  validationStatusId: number; // Required
  pipelineId: number; // Required
  
  // Nested objects (for read operations)
  recordedBy?: EmployeeDTO;
  validatedBy?: EmployeeDTO;
  validationStatus?: ValidationStatusDTO;
  pipeline?: PipelineDTO;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create flow reading request DTO
 */
export interface CreateFlowReadingDTO {
  recordedAt: string;
  pressure?: number;
  temperature?: number;
  flowRate?: number;
  containedVolume?: number;
  notes?: string;
  recordedById: number;
  validationStatusId: number;
  pipelineId: number;
}

/**
 * Update flow reading request DTO
 */
export interface UpdateFlowReadingDTO extends Partial<CreateFlowReadingDTO> {
  validatedAt?: string;
  validatedById?: number;
}

/**
 * Flow reading validation constraints
 */
export const FlowReadingConstraints = {
  pressure: {
    min: 0,
    max: 500,
    unit: 'bar',
  },
  temperature: {
    min: -50,
    max: 200,
    unit: '°C',
  },
  flowRate: {
    min: 0,
    unit: 'm³/h',
  },
  containedVolume: {
    min: 0,
    unit: 'm³',
  },
  notes: {
    maxLength: 500,
  },
};
