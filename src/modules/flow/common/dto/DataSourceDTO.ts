/**
 * Data Source DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: DataSourceDTO.java (01-23-2026)
 */

export interface DataSourceDTO {
  id?: number;
  code: string;
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  isManual: boolean;
  requiresValidation: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum DataSourceCode {
  MANUAL_ENTRY = 'MANUAL_ENTRY',
  EXCEL_IMPORT = 'EXCEL_IMPORT',
  SCADA_EXPORT = 'SCADA_EXPORT',
  METER_READING = 'METER_READING',
  ESTIMATED = 'ESTIMATED',
}
