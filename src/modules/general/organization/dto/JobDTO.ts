/**
 * Job DTO
 * Data Transfer Object for Job entity
 * Aligned with Backend: dz.sh.trc.hyflo.general.organization.dto.JobDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 12-28-2025
 * @updated 01-06-2026 - Added validation function
 * @package common/administration
 */

export interface JobDTO {
  // Identifier
  id?: number;

  // Code (unique identifier, @NotBlank)
  code: string;

  // Designations (multilingual, max 100 chars each)
  designationAr?: string;
  designationEn?: string;
  designationFr: string; // @NotBlank

  // Structure relationship (required)
  structureId: number; // @NotBlank

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Validates JobDTO according to backend constraints
 * @param data - Partial job data to validate
 * @returns Array of validation error messages
 */
export const validateJobDTO = (data: Partial<JobDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.code) {
    errors.push("Code is required");
  }
  
  if (!data.designationFr) {
    errors.push("French designation is required");
  } else if (data.designationFr.length > 100) {
    errors.push("French designation must not exceed 100 characters");
  }
  
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Arabic designation must not exceed 100 characters");
  }
  
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("English designation must not exceed 100 characters");
  }
  
  if (!data.structureId) {
    errors.push("Structure is required");
  }
  
  return errors;
};
