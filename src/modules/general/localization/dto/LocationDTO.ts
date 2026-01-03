/**
 * Location DTO - Localization Module
 * Represents a location with geographic coordinates
 * 
 * Aligned with backend: dz.sh.trc.hyflo.general.localization.dto.LocationDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-03-2026
 */

import type { LocalityDTO } from './LocalityDTO';

export interface LocationDTO {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  locality: LocalityDTO;
  latitude: number;
  longitude: number;
  altitude?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
