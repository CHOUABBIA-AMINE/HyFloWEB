/**
 * MeasurementHour DTO - Network Flow Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.flow.dto.MeasurementHourDTO
 * 
 * Represents the time slot for flow measurements.
 * Standard measurement hours: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 (6 readings per day).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface MeasurementHourDTO {
  // Identifier
  id?: number;
  
  // Core field
  code: string; // @NotBlank, max 20 chars (required) - e.g., "00:00", "04:00", "08:00"
}

/**
 * Validates MeasurementHourDTO according to backend constraints
 */
export const validateMeasurementHourDTO = (data: Partial<MeasurementHourDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation (required)
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 20) {
    errors.push("Code must not exceed 20 characters");
  }
  
  return errors;
};

/**
 * Standard measurement hours (6 per day)
 */
export const STANDARD_MEASUREMENT_HOURS = [
  '00:00',
  '04:00',
  '08:00',
  '12:00',
  '16:00',
  '20:00'
] as const;

export type StandardMeasurementHour = typeof STANDARD_MEASUREMENT_HOURS[number];
