/**
 * Vendor DTO
 * Mirrors backend: dz.mdn.iaas.network.common.dto.VendorDTO
 */

import { CountryDTO } from '../../../common/administration/dto/CountryDTO';
import { VendorTypeDTO } from '../../type/dto/VendorTypeDTO';

export interface VendorDTO {
  id: number;

  name?: string | null;
  shortName?: string | null;

  vendorTypeId: number;
  countryId: number;

  vendorType?: VendorTypeDTO | null;
  country?: CountryDTO | null;
}
