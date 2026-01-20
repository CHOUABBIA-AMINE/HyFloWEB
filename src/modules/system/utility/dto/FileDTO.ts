/**
 * File DTO - System Utility Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.system.utility.dto.FileDTO
 * 
 * Represents uploaded files/attachments in the system.
 * Used for storing pictures, documents, and other file types.
 * 
 * Backend Fields:
 * - extension (F_01) - File extension (e.g., "jpg", "png") - Required, max 20 chars
 * - size (F_02) - File size in bytes - Must be non-negative
 * - path (F_03) - Storage path (e.g., "2026/01/20/uuid.jpg") - Required, max 250 chars
 * - fileType (F_04) - File category (e.g., "EMPLOYEE_PICTURE") - Optional, max 20 chars
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-08-2026
 * @updated 01-20-2026 - Fixed to match backend structure exactly
 */

export interface FileDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields (aligned with backend)
  extension: string;      // @NotBlank, max 20 chars - File extension ("jpg", "png", "pdf", etc.)
  size?: number;          // @Min(0) - File size in bytes
  path: string;           // @NotBlank, max 250 chars - Relative storage path
  fileType?: string;      // Optional, max 20 chars - Category/type ("EMPLOYEE_PICTURE", etc.)
}

/**
 * Validates FileDTO according to backend constraints
 */
export const validateFileDTO = (data: Partial<FileDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.extension) {
    errors.push("Extension is required");
  } else if (data.extension.length > 20) {
    errors.push("Extension must not exceed 20 characters");
  }
  
  if (!data.path) {
    errors.push("Path is required");
  } else if (data.path.length > 250) {
    errors.push("Path must not exceed 250 characters");
  }
  
  if (data.size !== undefined && data.size < 0) {
    errors.push("Size must not be negative");
  }
  
  if (data.fileType && data.fileType.length > 20) {
    errors.push("File type must not exceed 20 characters");
  }
  
  return errors;
};
