/**
 * ShelfFloor DTO
 * Matches: dz.mdn.iaas.common.environment.model.ShelfFloor.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

export interface ShelfFloorDTO {
  id?: number;
  code: string;
  designationLt?: string;
  designationAr?: string;
  floorNumber?: number;
  shelfId?: number;
  createdAt?: string;
  updatedAt?: string;
}
