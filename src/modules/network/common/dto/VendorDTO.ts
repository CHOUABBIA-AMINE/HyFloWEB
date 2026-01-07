/**
 * Vendor DTO - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.dto.VendorDTO
 * 
 * Represents equipment/material vendors (manufacturers, suppliers) in the network.
 * Vendors are classified by type and country.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { VendorTypeDTO } from '../../type/dto/VendorTypeDTO';
import { CountryDTO } from '../../../general/localization/dto/CountryDTO';

export interface VendorDTO {
  // Identifier
  id?: number;

  // Core fields
  name?: string; // Optional, max 100 chars
  shortName?: string; // Optional, 2-20 chars (note: backend doesn't require it)
  
  // Required relationships (IDs)
  vendorTypeId: number; // @NotNull (required)
  countryId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  vendorType?: VendorTypeDTO;
  country?: CountryDTO;
}

/**
 * Validates VendorDTO according to backend constraints
 */
export const validateVendorDTO = (data: Partial<VendorDTO>): string[] => {
  const errors: string[] = [];
  
  // Name validation (optional)
  if (data.name && data.name.length > 100) {
    errors.push("Name must not exceed 100 characters");
  }
  
  // Short name validation (optional, but if provided must be 2-20 chars)
  if (data.shortName) {
    if (data.shortName.length < 2 || data.shortName.length > 20) {
      errors.push("Short name must be between 2 and 20 characters");
    }
  }
  
  // Vendor type validation
  if (data.vendorTypeId === undefined || data.vendorTypeId === null) {
    errors.push("Vendor type is required");
  }
  
  // Country validation
  if (data.countryId === undefined || data.countryId === null) {
    errors.push("Country is required");
  }
  
  return errors;
};
