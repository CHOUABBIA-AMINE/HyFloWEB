/**
 * ArchiveBox DTO
 * Matches: dz.mdn.iaas.common.environment.model.ArchiveBox.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import { ShelfDTO } from './ShelfDTO';
import { ShelfFloorDTO } from './ShelfFloorDTO';

export interface ArchiveBoxDTO {
  id?: number;
  code: string;
  description?: string;
  shelfId?: number;
  shelf?: ShelfDTO;
  shelfFloorId?: number;
  shelfFloor?: ShelfFloorDTO;
  createdAt?: string;
  updatedAt?: string;
}
