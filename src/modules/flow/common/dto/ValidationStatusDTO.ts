/**
 * Validation Status DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: ValidationStatusDTO.java (01-23-2026)
 * 
 * Represents validation status for flow data verification tracking
 */

export interface ValidationStatusDTO {
  id?: number;
  
  // Core identification
  code: string; // Pattern: ^[A-Z0-9_-]+$ (e.g., "VALIDATED", "PENDING", "REJECTED")
  
  // Multilingual designations
  designationAr?: string; // Arabic designation (max 100 chars)
  designationEn?: string; // English designation (max 100 chars)
  designationFr: string;  // French designation (required, max 100 chars)
  
  // Multilingual descriptions
  descriptionAr?: string; // Arabic description (max 255 chars)
  descriptionEn?: string; // English description (max 255 chars)
  descriptionFr?: string; // French description (max 255 chars)
  
  // Audit fields (from backend GenericDTO)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Create validation status request DTO
 */
export interface CreateValidationStatusDTO {
  code: string;
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
}

/**
 * Update validation status request DTO
 */
export interface UpdateValidationStatusDTO extends Partial<CreateValidationStatusDTO> {}

/**
 * Common validation status codes (based on SONATRACH standards)
 */
export enum ValidationStatusCode {
  DRAFT = 'DRAFT',           // Initial entry, not submitted
  PENDING = 'PENDING',       // Submitted, awaiting validation
  VALIDATED = 'VALIDATED',   // Approved by supervisor
  REJECTED = 'REJECTED',     // Rejected by supervisor
  ARCHIVED = 'ARCHIVED',     // Historical/archived data
}

/**
 * Helper function to get status color for UI
 */
export const getValidationStatusColor = (code?: string): 'default' | 'info' | 'warning' | 'success' | 'error' => {
  switch (code) {
    case ValidationStatusCode.DRAFT:
      return 'default';
    case ValidationStatusCode.PENDING:
      return 'warning';
    case ValidationStatusCode.VALIDATED:
      return 'success';
    case ValidationStatusCode.REJECTED:
      return 'error';
    case ValidationStatusCode.ARCHIVED:
      return 'info';
    default:
      return 'default';
  }
};
