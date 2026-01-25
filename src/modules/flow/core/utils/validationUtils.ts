/**
 * Validation Utilities - Flow Core Module
 * 
 * Helper functions for validating Flow Core DTOs and measurements.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import { MEASUREMENT_CONSTRAINTS, VALIDATION_CONSTRAINTS } from './constants';
import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { FlowThresholdDTO } from '../dto/FlowThresholdDTO';

/**
 * Validate pressure measurement
 */
export function isValidPressure(pressure: number | null | undefined): boolean {
  if (pressure === null || pressure === undefined) return true; // Optional field
  return pressure >= MEASUREMENT_CONSTRAINTS.PRESSURE_MIN && 
         pressure <= MEASUREMENT_CONSTRAINTS.PRESSURE_MAX;
}

/**
 * Validate temperature measurement
 */
export function isValidTemperature(temperature: number | null | undefined): boolean {
  if (temperature === null || temperature === undefined) return true; // Optional field
  return temperature >= MEASUREMENT_CONSTRAINTS.TEMPERATURE_MIN && 
         temperature <= MEASUREMENT_CONSTRAINTS.TEMPERATURE_MAX;
}

/**
 * Validate flow rate measurement
 */
export function isValidFlowRate(flowRate: number | null | undefined): boolean {
  if (flowRate === null || flowRate === undefined) return true; // Optional field
  return flowRate >= MEASUREMENT_CONSTRAINTS.FLOW_RATE_MIN && 
         flowRate <= MEASUREMENT_CONSTRAINTS.FLOW_RATE_MAX;
}

/**
 * Validate volume measurement
 */
export function isValidVolume(volume: number | null | undefined): boolean {
  if (volume === null || volume === undefined) return true; // Optional field
  return volume >= MEASUREMENT_CONSTRAINTS.VOLUME_MIN && 
         volume <= MEASUREMENT_CONSTRAINTS.VOLUME_MAX;
}

/**
 * Validate flow reading DTO
 */
export function validateFlowReading(reading: Partial<FlowReadingDTO>): string[] {
  const errors: string[] = [];

  if (!reading.readingDate) {
    errors.push('Reading date is required');
  }

  if (reading.pressure !== null && reading.pressure !== undefined && !isValidPressure(reading.pressure)) {
    errors.push(`Pressure must be between ${MEASUREMENT_CONSTRAINTS.PRESSURE_MIN} and ${MEASUREMENT_CONSTRAINTS.PRESSURE_MAX} bar`);
  }

  if (reading.temperature !== null && reading.temperature !== undefined && !isValidTemperature(reading.temperature)) {
    errors.push(`Temperature must be between ${MEASUREMENT_CONSTRAINTS.TEMPERATURE_MIN} and ${MEASUREMENT_CONSTRAINTS.TEMPERATURE_MAX} °C`);
  }

  if (reading.flowRate !== null && reading.flowRate !== undefined && !isValidFlowRate(reading.flowRate)) {
    errors.push(`Flow rate must be between ${MEASUREMENT_CONSTRAINTS.FLOW_RATE_MIN} and ${MEASUREMENT_CONSTRAINTS.FLOW_RATE_MAX} m³/h`);
  }

  if (reading.volume !== null && reading.volume !== undefined && !isValidVolume(reading.volume)) {
    errors.push(`Volume must be between ${MEASUREMENT_CONSTRAINTS.VOLUME_MIN} and ${MEASUREMENT_CONSTRAINTS.VOLUME_MAX} m³`);
  }

  return errors;
}

/**
 * Validate threshold DTO
 */
export function validateFlowThreshold(threshold: Partial<FlowThresholdDTO>): string[] {
  const errors: string[] = [];

  if (threshold.minValue === null || threshold.minValue === undefined) {
    errors.push('Minimum value is required');
  }

  if (threshold.maxValue === null || threshold.maxValue === undefined) {
    errors.push('Maximum value is required');
  }

  if (
    threshold.minValue !== null && threshold.minValue !== undefined &&
    threshold.maxValue !== null && threshold.maxValue !== undefined &&
    threshold.minValue >= threshold.maxValue
  ) {
    errors.push('Minimum value must be less than maximum value');
  }

  return errors;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

/**
 * Validate notes length
 */
export function isValidNotes(notes: string | null | undefined): boolean {
  if (!notes) return true; // Notes are optional
  return notes.length <= VALIDATION_CONSTRAINTS.NOTES_MAX_LENGTH;
}

/**
 * Check if value breaches threshold
 */
export function isThresholdBreach(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'minValue' | 'maxValue'>
): boolean {
  if (threshold.minValue !== null && threshold.minValue !== undefined && value < threshold.minValue) {
    return true;
  }
  if (threshold.maxValue !== null && threshold.maxValue !== undefined && value > threshold.maxValue) {
    return true;
  }
  return false;
}

/**
 * Get breach type
 */
export function getBreachType(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'minValue' | 'maxValue'>
): 'BELOW_MIN' | 'ABOVE_MAX' | null {
  if (threshold.minValue !== null && threshold.minValue !== undefined && value < threshold.minValue) {
    return 'BELOW_MIN';
  }
  if (threshold.maxValue !== null && threshold.maxValue !== undefined && value > threshold.maxValue) {
    return 'ABOVE_MAX';
  }
  return null;
}
