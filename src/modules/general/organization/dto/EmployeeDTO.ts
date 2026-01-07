/**
 * Employee DTO - Organization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.organization.dto.EmployeeDTO
 * Updated: 01-07-2026 - Synced with backend U-002 update
 * 
 * IMPORTANT: Backend uses FLAT structure (no inheritance from PersonDTO)
 * EmployeeDTO contains all Person fields + Employee-specific fields
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { StateDTO } from '../../localization/dto/StateDTO';
import { CountryDTO } from '../../localization/dto/CountryDTO';
import { JobDTO } from './JobDTO';
import { FileDTO } from '../../../system/dto/FileDTO';

export interface EmployeeDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Name Fields (Arabic) - REQUIRED in Employee (unlike Person)
  lastNameAr: string; // @NotBlank, max 100 chars
  firstNameAr: string; // @NotBlank, max 100 chars

  // Name Fields (Latin) - Required
  lastNameLt: string; // @NotBlank, max 100 chars
  firstNameLt: string; // @NotBlank, max 100 chars

  // Birth Information
  birthDate?: Date | string;
  birthPlaceAr?: string; // max 200 chars
  birthPlaceLt?: string; // max 200 chars

  // Address Information
  addressAr?: string; // max 200 chars
  addressLt?: string; // max 200 chars

  // Employee-Specific Fields
  registrationNumber?: string; // max 50 chars

  // Relationship IDs (from backend)
  birthStateId?: number;
  addressStateId?: number;
  countryId?: number;
  pictureId?: number;
  jobId?: number; // Employee-specific

  // Nested Objects (optional, populated in responses)
  birthState?: StateDTO;
  addressState?: StateDTO;
  country?: CountryDTO;
  picture?: FileDTO;
  job?: JobDTO; // Employee-specific
}

/**
 * Validates EmployeeDTO according to backend constraints
 * @param data - Partial employee data to validate
 * @returns Array of validation error messages
 */
export const validateEmployeeDTO = (data: Partial<EmployeeDTO>): string[] => {
  const errors: string[] = [];
  
  // All names are required in Employee (Arabic AND Latin)
  if (!data.lastNameAr) {
    errors.push("Arabic last name is required");
  } else if (data.lastNameAr.length > 100) {
    errors.push("Arabic last name must not exceed 100 characters");
  }
  
  if (!data.firstNameAr) {
    errors.push("Arabic first name is required");
  } else if (data.firstNameAr.length > 100) {
    errors.push("Arabic first name must not exceed 100 characters");
  }
  
  if (!data.lastNameLt) {
    errors.push("Latin last name is required");
  } else if (data.lastNameLt.length > 100) {
    errors.push("Latin last name must not exceed 100 characters");
  }
  
  if (!data.firstNameLt) {
    errors.push("Latin first name is required");
  } else if (data.firstNameLt.length > 100) {
    errors.push("Latin first name must not exceed 100 characters");
  }
  
  // Registration number validation
  if (data.registrationNumber && data.registrationNumber.length > 50) {
    errors.push("Registration number must not exceed 50 characters");
  }
  
  // Place and address validations
  if (data.birthPlaceAr && data.birthPlaceAr.length > 200) {
    errors.push("Arabic birth place must not exceed 200 characters");
  }
  
  if (data.birthPlaceLt && data.birthPlaceLt.length > 200) {
    errors.push("Latin birth place must not exceed 200 characters");
  }
  
  if (data.addressAr && data.addressAr.length > 200) {
    errors.push("Arabic address must not exceed 200 characters");
  }
  
  if (data.addressLt && data.addressLt.length > 200) {
    errors.push("Latin address must not exceed 200 characters");
  }
  
  return errors;
};
