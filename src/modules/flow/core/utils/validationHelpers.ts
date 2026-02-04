/**
 * Validation Helpers
 * 
 * Validation functions for reading submission.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/utils
 */

import { ReadingSubmitRequestDTO } from '../dto/ReadingSubmitRequestDTO';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate reading submit request.
 * 
 * @param request - Reading submit request
 * @returns Validation result with errors
 */
export const validateSubmitRequest = (request: ReadingSubmitRequestDTO): ValidationResult => {
  const errors: string[] = [];

  if (!request.pipelineId) {
    errors.push('Pipeline is required');
  }

  if (!request.readingDate) {
    errors.push('Reading date is required');
  }

  if (!request.slotId) {
    errors.push('Slot is required');
  }

  if (!request.employeeId) {
    errors.push('Employee is required');
  }

  if (request.pressure == null) {
    errors.push('Pressure is required');
  } else if (request.pressure < 0) {
    errors.push('Pressure must be positive');
  }

  if (request.temperature == null) {
    errors.push('Temperature is required');
  }

  if (request.flowRate == null) {
    errors.push('Flow rate is required');
  } else if (request.flowRate < 0) {
    errors.push('Flow rate must be positive');
  }

  if (request.containedVolume != null && request.containedVolume < 0) {
    errors.push('Contained volume must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
