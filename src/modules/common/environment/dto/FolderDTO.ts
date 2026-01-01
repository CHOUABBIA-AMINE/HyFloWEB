/**
 * Folder DTO
 * Matches: dz.mdn.iaas.common.environment.model.Folder.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import { ArchiveBoxDTO } from './ArchiveBoxDTO';

export interface FolderDTO {
  id?: number;
  code: string;
  description?: string;
  archiveBoxId?: number;
  archiveBox?: ArchiveBoxDTO;
  createdAt?: string;
  updatedAt?: string;
}
