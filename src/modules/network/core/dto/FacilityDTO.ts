/**
 * Facility DTO
 * Mirrors backend: dz.mdn.iaas.network.core.dto.FacilityDTO
 */

import { LocalityDTO } from '../../../common/administration/dto/LocalityDTO';
import { OperationalStatusDTO, VendorDTO } from '../../common/dto';

export interface FacilityDTO {
  id: number;

  code: string;
  name: string;

  installationDate?: string | null;
  commissioningDate?: string | null;
  decommissioningDate?: string | null;

  placeName: string;
  latitude: number;
  longitude: number;
  elevation: number;

  operationalStatusId: number;
  vendorId: number;
  localityId: number;

  operationalStatus?: OperationalStatusDTO | null;
  vendor?: VendorDTO | null;
  locality?: LocalityDTO | null;
}
