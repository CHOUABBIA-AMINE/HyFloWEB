/**
 * Military Category DTO
 * Used to filter Military Ranks.
 * 
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 */

export interface MilitaryCategoryDTO {
  id?: number;
  code?: string;

  designationAr?: string;
  designationEn?: string;
  designationFr: string;
}
