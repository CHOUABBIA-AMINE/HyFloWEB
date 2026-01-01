/**
 * Activity DTO
 * Mirrors backend: dz.mdn.iaas.network.common.dto.ActivityDTO
 */

export interface ActivityDTO {
  id: number;
  code: string;

  designationAr?: string | null;
  designationEn?: string | null;
  designationFr: string;

  descriptionAr?: string | null;
  descriptionEn?: string | null;
  descriptionFr: string;
}
