/**
 * Region DTO
 * Mirrors backend: dz.mdn.iaas.network.common.dto.RegionDTO
 */

import { ActivityDTO } from './ActivityDTO';
import { ZoneDTO } from './ZoneDTO';

export interface RegionDTO {
  id: number;
  code: string;

  designationAr?: string | null;
  designationEn?: string | null;
  designationFr: string;

  descriptionAr?: string | null;
  descriptionEn?: string | null;
  descriptionFr: string;

  zoneId: number;
  activityId: number;

  zone?: ZoneDTO | null;
  activity?: ActivityDTO | null;
}
