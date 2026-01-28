/**
 * Flow Reading DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowReadingDTO
 * Updated: 01-28-2026 - Added readingDate and readingSlot for slot-based system
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { PipelineDTO } from '../../../network/core/dto/PipelineDTO';

export interface FlowReadingDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // ========== NEW: Temporal fields for slot-based system ==========
  readingDate: string; // @NotNull, LocalDate (ISO format: YYYY-MM-DD) - Business date for this reading (required)
  
  // Measurement data
  recordedAt: string; // @NotNull, @PastOrPresent, LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss) - System submission timestamp (required)
  pressure?: number;  // @PositiveOrZero, @DecimalMin(0.0), @DecimalMax(500.0) (bar)
  temperature?: number; // @DecimalMin(-50.0), @DecimalMax(200.0) (Celsius)
  flowRate?: number;  // @PositiveOrZero (m³/h)
  containedVolume?: number; // @PositiveOrZero (m³)
  
  // Validation tracking
  validatedAt?: string; // @PastOrPresent, LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  notes?: string; // Max 500 chars
  
  // Required relationships (IDs)
  recordedById: number; // @NotNull (required)
  validationStatusId: number; // @NotNull (required)
  pipelineId: number; // @NotNull (required)
  readingSlotId: number; // @NotNull (required) - NEW
  
  // Optional relationship (ID)
  validatedById?: number;
  
  // Nested objects (populated in responses)
  recordedBy?: EmployeeDTO;
  validatedBy?: EmployeeDTO;
  validationStatus?: ValidationStatusDTO;
  pipeline?: PipelineDTO;
  readingSlot?: ReadingSlotDTO; // NEW
}

/**
 * Validates FlowReadingDTO according to backend constraints
 * @param data - Partial flow reading data to validate
 * @returns Array of validation error messages
 */
export const validateFlowReadingDTO = (data: Partial<FlowReadingDTO>): string[] => {
  const errors: string[] = [];
  
  // Reading date validation (NEW)
  if (!data.readingDate) {
    errors.push('Reading date is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.readingDate)) {
    errors.push('Reading date must be in YYYY-MM-DD format');
  }
  
  // Reading slot validation (NEW)
  if (data.readingSlotId === undefined || data.readingSlotId === null) {
    errors.push('Reading slot is required');
  }
  
  // Recording timestamp validation
  if (!data.recordedAt) {
    errors.push('Recording timestamp is required');
  } else {
    const recordedDate = new Date(data.recordedAt);
    if (recordedDate > new Date()) {
      errors.push('Recording time cannot be in the future');
    }
  }
  
  // Pressure validation
  if (data.pressure !== undefined && data.pressure !== null) {
    if (data.pressure < 0) {
      errors.push('Pressure cannot be negative');
    } else if (data.pressure > 500) {
      errors.push('Pressure exceeds maximum (500 bar)');
    }
  }
  
  // Temperature validation
  if (data.temperature !== undefined && data.temperature !== null) {
    if (data.temperature < -50) {
      errors.push('Temperature below minimum range (-50°C)');
    } else if (data.temperature > 200) {
      errors.push('Temperature exceeds maximum range (200°C)');
    }
  }
  
  // Flow rate validation
  if (data.flowRate !== undefined && data.flowRate !== null && data.flowRate < 0) {
    errors.push('Flow rate must be zero or positive');
  }
  
  // Contained volume validation
  if (data.containedVolume !== undefined && data.containedVolume !== null && data.containedVolume < 0) {
    errors.push('Contained volume must be zero or positive');
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
  
  // Recording employee validation
  if (data.recordedById === undefined || data.recordedById === null) {
    errors.push('Recording employee is required');
  }
  
  // Validation status validation
  if (data.validationStatusId === undefined || data.validationStatusId === null) {
    errors.push('Validation status is required');
  }
  
  // Pipeline validation
  if (data.pipelineId === undefined || data.pipelineId === null) {
    errors.push('Pipeline is required');
  }
  
  return errors;
};

/**
 * Flow reading measurement constraints
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
