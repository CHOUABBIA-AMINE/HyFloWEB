/**
 * Product DTO
 * Mirrors backend: dz.mdn.iaas.network.common.dto.ProductDTO
 */

export interface ProductDTO {
  id: number;
  code: string;

  designationAr?: string | null;
  designationEn?: string | null;
  designationFr: string;

  density: number;
  viscosity: number;
  flashPoint: number;
  sulfurContent: number;
  isHazardous: boolean;
}
