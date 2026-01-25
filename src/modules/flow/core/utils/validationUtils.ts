/**
 * Validation Utilities - Flow Core Module
 * 
 * Helper functions for validating Flow Core DTOs and measurements.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 01-25-2026
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

  if (!reading.recordedAt) {
    errors.push('Recording timestamp is required');
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

  if (reading.containedVolume !== null && reading.containedVolume !== undefined && !isValidVolume(reading.containedVolume)) {
    errors.push(`Volume must be between ${MEASUREMENT_CONSTRAINTS.VOLUME_MIN} and ${MEASUREMENT_CONSTRAINTS.VOLUME_MAX} m³`);
  }

  return errors;
}

/**
 * Validate threshold DTO
 */
export function validateFlowThreshold(threshold: Partial<FlowThresholdDTO>): string[] {
  const errors: string[] = [];

  // Pressure thresholds
  if (threshold.pressureMin === null || threshold.pressureMin === undefined) {
    errors.push('Minimum pressure is required');
  }
  if (threshold.pressureMax === null || threshold.pressureMax === undefined) {
    errors.push('Maximum pressure is required');
  }
  if (
    threshold.pressureMin !== null && threshold.pressureMin !== undefined &&
    threshold.pressureMax !== null && threshold.pressureMax !== undefined &&
    threshold.pressureMin >= threshold.pressureMax
  ) {
    errors.push('Minimum pressure must be less than maximum pressure');
  }

  // Temperature thresholds
  if (threshold.temperatureMin === null || threshold.temperatureMin === undefined) {
    errors.push('Minimum temperature is required');
  }
  if (threshold.temperatureMax === null || threshold.temperatureMax === undefined) {
    errors.push('Maximum temperature is required');
  }
  if (
    threshold.temperatureMin !== null && threshold.temperatureMin !== undefined &&
    threshold.temperatureMax !== null && threshold.temperatureMax !== undefined &&
    threshold.temperatureMin >= threshold.temperatureMax
  ) {
    errors.push('Minimum temperature must be less than maximum temperature');
  }

  // Flow rate thresholds
  if (threshold.flowRateMin === null || threshold.flowRateMin === undefined) {
    errors.push('Minimum flow rate is required');
  }
  if (threshold.flowRateMax === null || threshold.flowRateMax === undefined) {
    errors.push('Maximum flow rate is required');
  }
  if (
    threshold.flowRateMin !== null && threshold.flowRateMin !== undefined &&
    threshold.flowRateMax !== null && threshold.flowRateMax !== undefined &&
    threshold.flowRateMin >= threshold.flowRateMax
  ) {
    errors.push('Minimum flow rate must be less than maximum flow rate');
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
 * Check if pressure value breaches threshold
 */
export function isPressureThresholdBreach(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'pressureMin' | 'pressureMax'>
): boolean {
  if (value < threshold.pressureMin) return true;
  if (value > threshold.pressureMax) return true;
  return false;
}

/**
 * Check if temperature value breaches threshold
 */
export function isTemperatureThresholdBreach(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'temperatureMin' | 'temperatureMax'>
): boolean {
  if (value < threshold.temperatureMin) return true;
  if (value > threshold.temperatureMax) return true;
  return false;
}

/**
 * Check if flow rate value breaches threshold
 */
export function isFlowRateThresholdBreach(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'flowRateMin' | 'flowRateMax'>
): boolean {
  if (value < threshold.flowRateMin) return true;
  if (value > threshold.flowRateMax) return true;
  return false;
}

/**
 * Get pressure breach type
 */
export function getPressureBreachType(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'pressureMin' | 'pressureMax'>
): 'BELOW_MIN' | 'ABOVE_MAX' | null {
  if (value < threshold.pressureMin) return 'BELOW_MIN';
  if (value > threshold.pressureMax) return 'ABOVE_MAX';
  return null;
}

/**
 * Get temperature breach type
 */
export function getTemperatureBreachType(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'temperatureMin' | 'temperatureMax'>
): 'BELOW_MIN' | 'ABOVE_MAX' | null {
  if (value < threshold.temperatureMin) return 'BELOW_MIN';
  if (value > threshold.temperatureMax) return 'ABOVE_MAX';
  return null;
}

/**
 * Get flow rate breach type
 */
export function getFlowRateBreachType(
  value: number,
  threshold: Pick<FlowThresholdDTO, 'flowRateMin' | 'flowRateMax'>
): 'BELOW_MIN' | 'ABOVE_MAX' | null {
  if (value < threshold.flowRateMin) return 'BELOW_MIN';
  if (value > threshold.flowRateMax) return 'ABOVE_MAX';
  return null;
}
