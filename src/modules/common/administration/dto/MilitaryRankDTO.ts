/**
 * Military Rank DTO
 * Backend returns multilingual designations and is linked to MilitaryCategory.
 * 
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 * @updated 01-01-2026 - Align with backend (designationAr/En/Fr)
 */

export interface MilitaryRankDTO {
  id?: number;

  code?: string;
  abbreviation?: string;

  designationAr?: string;
  designationEn?: string;
  designationFr: string;

  militaryCategoryId?: number;
}
