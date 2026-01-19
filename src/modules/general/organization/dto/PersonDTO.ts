/**
 * Person DTO - Organization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.organization.dto.PersonDTO
 * Updated: 01-19-2026 - Changed State to Locality (birthLocality, addressLocality)
 * Updated: 01-08-2026 - Fixed FileDTO import path
 * 
 * UPDATE U-003: Arabic names are now OPTIONAL (not required)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocalityDTO } from '../../localization/dto/LocalityDTO';
import { CountryDTO } from '../../localization/dto/CountryDTO';
import { FileDTO } from '../../../system/utility/dto/FileDTO';

export interface PersonDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Name Fields (Arabic) - OPTIONAL (U-003 update)
  lastNameAr?: string; // max 100 chars (optional)
  firstNameAr?: string; // max 100 chars (optional)

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

  // Relationship IDs (from backend)
  birthLocalityId?: number;
  addressLocalityId?: number;
  countryId?: number;
  pictureId?: number;

  // Nested Objects (optional, populated in responses)
  birthLocality?: LocalityDTO;
  addressLocality?: LocalityDTO;
  country?: CountryDTO;
  picture?: FileDTO;
}

/**
 * Validates PersonDTO according to backend constraints
 * Note: U-003 update made Arabic names optional
 * @param data - Partial person data to validate
 * @returns Array of validation error messages
 */
export const validatePersonDTO = (data: Partial<PersonDTO>): string[] => {
  const errors: string[] = [];
  
  // Latin names are required
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
  
  // Arabic names are optional but have max length
  if (data.lastNameAr && data.lastNameAr.length > 100) {
    errors.push("Arabic last name must not exceed 100 characters");
  }
  
  if (data.firstNameAr && data.firstNameAr.length > 100) {
    errors.push("Arabic first name must not exceed 100 characters");
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
