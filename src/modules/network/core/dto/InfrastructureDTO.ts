/**
 * Infrastructure DTO
 * Mirrors backend: dz.mdn.iaas.network.core.dto.InfrastructureDTO
 */

import { OperationalStatusDTO, RegionDTO } from '../../common/dto';

export interface InfrastructureDTO {
  id: number;

  code: string;
  name: string;

  installationDate?: string | null;
  commissioningDate?: string | null;
  decommissioningDate?: string | null;

  operationalStatusId: number;
  regionId: number;

  operationalStatus?: OperationalStatusDTO | null;
  region?: RegionDTO | null;
}
