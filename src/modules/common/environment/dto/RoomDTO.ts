/**
 * Room DTO
 * Matches: dz.mdn.iaas.common.environment.model.Room.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import { BlocDTO } from './BlocDTO';
import { FloorDTO } from './FloorDTO';

export interface RoomDTO {
  id?: number;
  code: string;
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  blocId?: number;
  bloc?: BlocDTO;
  floorId?: number;
  floor?: FloorDTO;
  createdAt?: string;
  updatedAt?: string;
}
