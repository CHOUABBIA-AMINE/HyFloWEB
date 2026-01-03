/**
 * Country DTO
 * Backend returns multilingual designations.
 * 
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 * @updated 01-01-2026 - Align with backend (designationAr/En/Fr)
 */

export interface CountryDTO {
  id?: number;
  code?: string;

  designationAr?: string;
  designationEn?: string;
  designationFr: string;
}
