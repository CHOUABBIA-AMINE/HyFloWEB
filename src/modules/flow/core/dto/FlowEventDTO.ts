/**
 * Flow Event DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowEventDTO
 * Updated: 01-25-2026 - Aligned with backend using FacilityDTO template
 * 
 * Backend file needs to be checked - creating based on original requirements
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { EventStatusDTO } from '../../common/dto/EventStatusDTO';
import { SeverityDTO } from '../../common/dto/SeverityDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';
import { EventTypeDTO } from '../../type/dto/EventTypeDTO';

export interface FlowEventDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Event data
  startTime: string; // LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss) (required)
  endTime?: string; // LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  title: string; // Max 200 chars (required)
  description?: string; // Max 1000 chars
  impact?: string; // Max 500 chars
  resolution?: string; // Max 500 chars
  
  // Required relationships (IDs)
  infrastructureId: number; // (required)
  typeId: number; // (required) - Event type
  severityId: number; // (required)
  statusId: number; // (required) - Event status
  reportedById: number; // (required)
  
  // Optional relationship (ID)
  resolvedById?: number;
  
  // Nested objects (populated in responses)
  infrastructure?: InfrastructureDTO;
  type?: EventTypeDTO;
  severity?: SeverityDTO;
  status?: EventStatusDTO;
  reportedBy?: EmployeeDTO;
  resolvedBy?: EmployeeDTO;
}

/**
 * Validates FlowEventDTO according to backend constraints
 * @param data - Partial flow event data to validate
 * @returns Array of validation error messages
 */
export const validateFlowEventDTO = (data: Partial<FlowEventDTO>): string[] => {
  const errors: string[] = [];
  
  // Start time validation
  if (!data.startTime) {
    errors.push('Start time is required');
  }
  
  // Title validation
  if (!data.title) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must not exceed 200 characters');
  }
  
  // Description validation
  if (data.description && data.description.length > 1000) {
    errors.push('Description must not exceed 1000 characters');
  }
  
  // Impact validation
  if (data.impact && data.impact.length > 500) {
    errors.push('Impact must not exceed 500 characters');
  }
  
  // Resolution validation
  if (data.resolution && data.resolution.length > 500) {
    errors.push('Resolution must not exceed 500 characters');
  }
  
  // Infrastructure validation
  if (data.infrastructureId === undefined || data.infrastructureId === null) {
    errors.push('Infrastructure is required');
  }
  
  // Event type validation
  if (data.typeId === undefined || data.typeId === null) {
    errors.push('Event type is required');
  }
  
  // Severity validation
  if (data.severityId === undefined || data.severityId === null) {
    errors.push('Severity is required');
  }
  
  // Event status validation
  if (data.statusId === undefined || data.statusId === null) {
    errors.push('Event status is required');
  }
  
  // Reported by validation
  if (data.reportedById === undefined || data.reportedById === null) {
    errors.push('Reported by employee is required');
  }
  
  return errors;
};
