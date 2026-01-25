/**
 * Flow Alert DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowAlertDTO
 * Updated: 01-25-2026 - Aligned with backend using FacilityDTO template
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { AlertStatusDTO } from '../../common/dto/AlertStatusDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { FlowThresholdDTO } from './FlowThresholdDTO';
import { FlowReadingDTO } from './FlowReadingDTO';

export interface FlowAlertDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Alert data
  alertTimestamp: string; // @NotNull, @PastOrPresent, LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss) (required)
  actualValue: number; // @NotNull (required)
  thresholdValue?: number;
  message?: string; // Max 1000 chars
  acknowledgedAt?: string; // @PastOrPresent, LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  resolvedAt?: string; // @PastOrPresent, LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  resolutionNotes?: string; // Max 1000 chars
  notificationSent: boolean; // @NotNull (required)
  notificationSentAt?: string; // @PastOrPresent, LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  
  // Required relationships (IDs)
  thresholdId: number; // @NotNull (required)
  
  // Optional relationships (IDs)
  resolvedById?: number;
  flowReadingId?: number;
  statusId?: number;
  acknowledgedById?: number;
  
  // Nested objects (populated in responses)
  resolvedBy?: EmployeeDTO;
  threshold?: FlowThresholdDTO;
  flowReading?: FlowReadingDTO;
  status?: AlertStatusDTO;
  acknowledgedBy?: EmployeeDTO;
}

/**
 * Validates FlowAlertDTO according to backend constraints
 * @param data - Partial flow alert data to validate
 * @returns Array of validation error messages
 */
export const validateFlowAlertDTO = (data: Partial<FlowAlertDTO>): string[] => {
  const errors: string[] = [];
  
  // Alert timestamp validation
  if (!data.alertTimestamp) {
    errors.push('Alert timestamp is required');
  } else {
    const alertDate = new Date(data.alertTimestamp);
    if (alertDate > new Date()) {
      errors.push('Alert timestamp cannot be in the future');
    }
  }
  
  // Actual value validation
  if (data.actualValue === undefined || data.actualValue === null) {
    errors.push('Actual value is required');
  }
  
  // Message validation
  if (data.message && data.message.length > 1000) {
    errors.push('Alert message must not exceed 1000 characters');
  }
  
  // Acknowledged at validation
  if (data.acknowledgedAt) {
    const acknowledgedDate = new Date(data.acknowledgedAt);
    if (acknowledgedDate > new Date()) {
      errors.push('Acknowledgment time cannot be in the future');
    }
  }
  
  // Resolved at validation
  if (data.resolvedAt) {
    const resolvedDate = new Date(data.resolvedAt);
    if (resolvedDate > new Date()) {
      errors.push('Resolution time cannot be in the future');
    }
  }
  
  // Resolution notes validation
  if (data.resolutionNotes && data.resolutionNotes.length > 1000) {
    errors.push('Resolution notes must not exceed 1000 characters');
  }
  
  // Notification sent validation
  if (data.notificationSent === undefined || data.notificationSent === null) {
    errors.push('Notification sent flag is required');
  }
  
  // Notification sent at validation
  if (data.notificationSentAt) {
    const notificationDate = new Date(data.notificationSentAt);
    if (notificationDate > new Date()) {
      errors.push('Notification time cannot be in the future');
    }
  }
  
  // Threshold validation
  if (data.thresholdId === undefined || data.thresholdId === null) {
    errors.push('Threshold is required');
  }
  
  return errors;
};
