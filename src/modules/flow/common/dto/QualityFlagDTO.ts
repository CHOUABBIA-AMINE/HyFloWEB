/**
 * Quality Flag DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: QualityFlagDTO.java (01-23-2026)
 */

export interface QualityFlagDTO {
  id?: number;
  code: string;
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  requiresReview: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum QualityFlagCode {
  GOOD = 'GOOD',
  ESTIMATED = 'ESTIMATED',
  SUSPECT = 'SUSPECT',
  MISSING = 'MISSING',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
}
