/**
 * Event Type DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: EventTypeDTO.java (01-23-2026)
 */

export interface EventTypeDTO {
  id?: number;
  code: string;
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum EventTypeCode {
  MAINTENANCE = 'MAINTENANCE',
  SHUTDOWN = 'SHUTDOWN',
  LEAK = 'LEAK',
  PRESSURE_DROP = 'PRESSURE_DROP',
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
  INSPECTION = 'INSPECTION',
}
