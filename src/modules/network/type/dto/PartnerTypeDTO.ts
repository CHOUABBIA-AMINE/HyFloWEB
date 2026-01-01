/**
 * PartnerType DTO
 * Mirrors backend: dz.mdn.iaas.network.type.dto.PartnerTypeDTO
 */

export interface PartnerTypeDTO {
  id: number;
  designationAr?: string | null;
  designationEn?: string | null;
  designationFr: string;
}
