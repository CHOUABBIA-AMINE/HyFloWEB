/**
 * Location DTO
 * Mirrors backend: dz.mdn.iaas.network.common.dto.LocationDTO
 */

import { LocalityDTO } from '../../../common/administration/dto/LocalityDTO';

export interface LocationDTO {
  id: number;
  code: string;

  designationAr?: string | null;
  designationEn?: string | null;
  designationFr: string;

  latitude: number;
  longitude: number;
  elevation?: number | null;

  localityId: number;
  locality?: LocalityDTO | null;
}
