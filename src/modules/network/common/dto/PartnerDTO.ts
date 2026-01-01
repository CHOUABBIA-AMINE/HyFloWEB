/**
 * Partner DTO
 * Mirrors backend: dz.mdn.iaas.network.common.dto.PartnerDTO
 */

import { CountryDTO } from '../../../common/administration/dto/CountryDTO';
import { PartnerTypeDTO } from '../../type/dto/PartnerTypeDTO';

export interface PartnerDTO {
  id: number;

  name?: string | null;
  shortName: string;

  partnerTypeId: number;
  countryId: number;

  partnerType?: PartnerTypeDTO | null;
  country?: CountryDTO | null;
}
