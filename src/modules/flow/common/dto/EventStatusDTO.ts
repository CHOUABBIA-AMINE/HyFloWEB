/**
 * Event Status DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: EventStatusDTO.java (01-23-2026)
 */

export interface EventStatusDTO {
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

export enum EventStatusCode {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
