/**
 * Partner DTO - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.dto.PartnerDTO
 * 
 * Represents business partners (operators, contractors, etc.) in the network.
 * Partners are classified by type and country.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { PartnerTypeDTO } from '../../type/dto/PartnerTypeDTO';
import { CountryDTO } from '../../../general/localization/dto/CountryDTO';

export interface PartnerDTO {
  // Identifier
  id?: number;

  // Core fields
  name?: string; // Optional, max 100 chars
  shortName: string; // @NotBlank, 2-20 chars (required)
  
  // Required relationships (IDs)
  partnerTypeId: number; // @NotNull (required)
  countryId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  partnerType?: PartnerTypeDTO;
  country?: CountryDTO;
}

/**
 * Validates PartnerDTO according to backend constraints
 */
export const validatePartnerDTO = (data: Partial<PartnerDTO>): string[] => {
  const errors: string[] = [];
  
  // Name validation (optional)
  if (data.name && data.name.length > 100) {
    errors.push("Name must not exceed 100 characters");
  }
  
  // Short name validation (required)
  if (!data.shortName) {
    errors.push("Short name is required");
  } else if (data.shortName.length < 2 || data.shortName.length > 20) {
    errors.push("Short name must be between 2 and 20 characters");
  }
  
  // Partner type validation
  if (data.partnerTypeId === undefined || data.partnerTypeId === null) {
    errors.push("Partner type is required");
  }
  
  // Country validation
  if (data.countryId === undefined || data.countryId === null) {
    errors.push("Country is required");
  }
  
  return errors;
};
