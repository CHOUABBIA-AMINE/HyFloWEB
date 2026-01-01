/**
 * VendorType DTO
 * Mirrors backend: dz.mdn.iaas.network.type.dto.VendorTypeDTO
 */

export interface VendorTypeDTO {
  id: number;
  designationAr?: string | null;
  designationEn?: string | null;
  designationFr: string;
}
