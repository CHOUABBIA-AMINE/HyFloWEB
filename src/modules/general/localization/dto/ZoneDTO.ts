/**
 * Zone DTO - Localization Module
 * Represents a zone or region in the system
 * 
 * Aligned with backend: dz.sh.trc.hyflo.general.localization.dto.ZoneDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-03-2026
 */

export interface ZoneDTO {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
