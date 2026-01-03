/**
 * File DTO
 * Data Transfer Object for File entity (Utility)
 * Aligned with Backend: dz.sh.trc.hyflo.system.utility.dto.FileDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-03-2026
 * @package system/utility
 */

export interface FileDTO {
  // Identifier
  id?: number;

  // File Information
  name?: string;
  path?: string;
  mimeType?: string;
  size?: number;
  extension?: string;

  // Metadata
  originalName?: string;
  uploadDate?: string;
  url?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
