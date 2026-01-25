/**
 * Alert Status DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: AlertStatusDTO.java (01-23-2026)
 */

export interface AlertStatusDTO {
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

export enum AlertStatusCode {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}
