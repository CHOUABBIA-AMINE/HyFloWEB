/**
 * Parameter Type DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: ParameterTypeDTO.java (01-23-2026)
 */

export interface ParameterTypeDTO {
  id?: number;
  code: string;
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  unit?: string; // Measurement unit (e.g., "bar", "°C", "m³/h")
  createdAt?: string;
  updatedAt?: string;
}

export enum ParameterTypeCode {
  PRESSURE = 'PRESSURE',
  TEMPERATURE = 'TEMPERATURE',
  FLOW_RATE = 'FLOW_RATE',
  VOLUME = 'VOLUME',
  DENSITY = 'DENSITY',
}
