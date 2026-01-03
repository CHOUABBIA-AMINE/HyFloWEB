/**
 * State DTO - Localization Module
 * Represents a state/province in the system
 * 
 * Aligned with backend: dz.sh.trc.hyflo.general.localization.dto.StateDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-03-2026
 */

import type { CountryDTO } from './CountryDTO';

export interface StateDTO {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  country: CountryDTO;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
