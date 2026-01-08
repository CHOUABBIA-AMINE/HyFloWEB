/**
 * File DTO - System Utility Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.system.utility.dto.FileDTO
 * 
 * Represents uploaded files/attachments in the system.
 * Used for storing pictures, documents, and other file types.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-08-2026
 */

export interface FileDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  fileName: string; // @NotBlank - Original file name
  filePath?: string; // Storage path
  fileType?: string; // MIME type
  fileSize?: number; // Size in bytes
  uploadDate?: Date | string; // Upload timestamp
  
  // Optional metadata
  description?: string;
  category?: string; // File category (picture, document, etc.)
}

/**
 * Validates FileDTO according to backend constraints
 */
export const validateFileDTO = (data: Partial<FileDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.fileName) {
    errors.push("File name is required");
  }
  
  return errors;
};
