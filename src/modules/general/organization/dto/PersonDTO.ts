/**
 * Person DTO
 * Data Transfer Object for Person entity
 * Aligned with Backend: dz.sh.trc.hyflo.general.organization.dto.PersonDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 12-23-2025
 * @updated 01-03-2026
 * @package common/administration
 */

import { StateDTO } from './StateDTO';
import { CountryDTO } from './CountryDTO';
import { FileDTO } from '../../system/dto/FileDTO';

export interface PersonDTO {
  // Identifier
  id?: number;

  // Name Fields (Arabic)
  lastNameAr: string;
  firstNameAr: string;

  // Name Fields (Latin)
  lastNameLt: string;
  firstNameLt: string;

  // Birth Information
  birthDate?: string | Date;
  birthPlaceAr?: string;
  birthPlaceLt?: string;

  // Address Information
  addressAr?: string;
  addressLt?: string;

  // Foreign Keys (IDs)
  birthStateId?: number;
  addressStateId?: number;
  pictureId?: number;
  countryId?: number;

  // Relationships (Objects)
  birthState?: StateDTO;
  addressState?: StateDTO;
  picture?: FileDTO;
  country?: CountryDTO;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
