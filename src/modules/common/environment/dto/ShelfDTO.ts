/**
 * Shelf DTO
 * Matches: dz.mdn.iaas.common.environment.model.Shelf.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

export interface ShelfDTO {
  id?: number;
  code: string;
  designationLt?: string;
  designationAr?: string;
  roomId?: number;
  createdAt?: string;
  updatedAt?: string;
}
