/**
 * Country DTO - Localization Module
 * Represents a country in the system
 * 
 * Aligned with backend: dz.sh.trc.hyflo.general.localization.dto.CountryDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-03-2026
 */

export interface CountryDTO {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  flagUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
