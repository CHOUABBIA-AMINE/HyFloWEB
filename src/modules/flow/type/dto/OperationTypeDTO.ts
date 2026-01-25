/**
 * Operation Type DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: OperationTypeDTO.java (01-23-2026)
 */

export interface OperationTypeDTO {
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

export enum OperationTypeCode {
  PRODUCTION = 'PRODUCTION',
  CONSUMPTION = 'CONSUMPTION',
  TRANSPORTATION = 'TRANSPORTATION',
  STORAGE = 'STORAGE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}
