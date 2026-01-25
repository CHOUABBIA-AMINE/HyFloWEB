/**
 * Severity DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: SeverityDTO.java (01-23-2026)
 */

export interface SeverityDTO {
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

export enum SeverityCode {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const getSeverityColor = (code?: string): 'default' | 'info' | 'warning' | 'error' => {
  switch (code) {
    case SeverityCode.LOW: return 'info';
    case SeverityCode.MEDIUM: return 'warning';
    case SeverityCode.HIGH: return 'warning';
    case SeverityCode.CRITICAL: return 'error';
    default: return 'default';
  }
};
