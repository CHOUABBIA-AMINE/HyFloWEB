/**
 * TerminalType DTO
 * Data Transfer Object for TerminalType entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 */

export interface TerminalTypeDTO {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  designationAr?: string;
  designationEn?: string;
  designationFr?: string;
  createdAt?: string;
  updatedAt?: string;
}
