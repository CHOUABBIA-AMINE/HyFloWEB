/**
 * Flow Reading DTO
 * 
 * Flow measurement reading capturing pipeline operational parameters.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowReadingDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 2026-01-23
 * @updated 2026-02-04 - Frontend alignment
 * @package flow/core/dto
 */

import { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

export interface FlowReadingDTO {
  // Identifier
  id?: number;
  
  // Reading data
  /** Reading date (YYYY-MM-DD) */
  readingDate: string;
  
  /** Pressure in bar (0.0-500.0) */
  pressure?: number;
  
  /** Temperature in Celsius (-50.0 to 200.0) */
  temperature?: number;
  
  /** Flow rate in m³/h */
  flowRate?: number;
  
  /** Contained volume in m³ */
  containedVolume?: number;
  
  /** Timestamp when recorded (ISO 8601) */
  recordedAt: string;
  
  /** Timestamp when validated (ISO 8601) */
  validatedAt?: string | null;
  
  /** Additional notes (max 500 chars) */
  notes?: string;
  
  // Foreign Key IDs
  /** Recorded by employee ID */
  recordedById: number;
  
  /** Validated by employee ID */
  validatedById?: number | null;
  
  /** Validation status ID */
  validationStatusId: number;
  
  /** Pipeline ID */
  pipelineId: number;
  
  /** Reading slot ID */
  readingSlotId: number;
  
  // Nested DTOs
  /** Recording employee details */
  recordedBy?: EmployeeDTO;
  
  /** Validating employee details */
  validatedBy?: EmployeeDTO;
  
  /** Validation status details */
  validationStatus?: ValidationStatusDTO;
  
  /** Pipeline details */
  pipeline?: PipelineDTO;
  
  /** Reading slot details */
  readingSlot?: ReadingSlotDTO;
}
