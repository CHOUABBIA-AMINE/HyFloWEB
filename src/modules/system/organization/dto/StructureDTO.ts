/**
 * Structure DTO
 * Matches: dz.mdn.iaas.system.organization.model.Structure.java
 * Represents organizational structure/division
 * 
 * @author CHOUABBIA Amine
 * @created 12-29-2025
 */

export interface StructureDTO {
  id?: number;
  code: string;
  designationAr?: string;
  designationFr?: string;
  designationEn?: string;
  abbreviationAr?: string;
  abbreviationFr?: string;
  abbreviationEn?: string;
  parentId?: number;
  level?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
