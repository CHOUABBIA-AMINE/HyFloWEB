/**
 * Structure Type DTO
 * Data Transfer Object for StructureType entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 */

export interface StructureTypeDTO {
  id: number;
  label: string;
  description?: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}
