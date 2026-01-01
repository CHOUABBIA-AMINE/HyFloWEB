/**
 * PipelineSystem DTO
 * Mirrors backend: dz.mdn.iaas.network.core.dto.PipelineSystemDTO
 *
 * @updated 01-01-2026 - Align with backend DTO layer (ids + expanded objects)
 */

import { OperationalStatusDTO, ProductDTO, RegionDTO } from '../../common/dto';

export interface PipelineSystemDTO {
  id: number;

  code: string;
  name: string;

  productId: number;
  operationalStatusId: number;
  regionId: number;

  product?: ProductDTO | null;
  operationalStatus?: OperationalStatusDTO | null;
  region?: RegionDTO | null;
}
