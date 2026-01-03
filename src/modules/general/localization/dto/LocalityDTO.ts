/**
 * Locality DTO - Localization Module
 * Represents a locality (city, town, district) in the system
 * 
 * Aligned with backend: dz.sh.trc.hyflo.general.localization.dto.LocalityDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-03-2026
 */

import type { StateDTO } from './StateDTO';

export interface LocalityDTO {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  state: StateDTO;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
