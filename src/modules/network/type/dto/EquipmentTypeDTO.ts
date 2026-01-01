/**
 * EquipmentType DTO
 * Mirrors backend: dz.mdn.iaas.network.type.dto.EquipmentTypeDTO
 */

export interface EquipmentTypeDTO {
  id: number;
  code: string;

  designationAr?: string | null;
  designationEn?: string | null;
  designationFr: string;
}
