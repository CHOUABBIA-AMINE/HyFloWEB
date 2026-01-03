/**
 * Employee DTO
 * Data Transfer Object for Employee entity
 * Aligned with Backend: dz.sh.trc.hyflo.general.organization.dto.EmployeeDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 12-30-2025
 * @updated 01-03-2026
 * @package common/administration
 */

import { StateDTO } from './StateDTO';
import { CountryDTO } from './CountryDTO';
import { JobDTO } from './JobDTO';
import { FileDTO } from '../../system/dto/FileDTO';

export interface EmployeeDTO {
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

  // Administrative Information
  registrationNumber?: string;

  // Foreign Keys (IDs)
  birthStateId?: number;
  addressStateId?: number;
  pictureId?: number;
  countryId?: number;
  jobId?: number;

  // Relationships (Objects)
  birthState?: StateDTO;
  addressState?: StateDTO;
  picture?: FileDTO;
  country?: CountryDTO;
  job?: JobDTO;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
