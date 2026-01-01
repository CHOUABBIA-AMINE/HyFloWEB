/**
 * StationType DTO
 * Data Transfer Object for StationType entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-23-2025
 */

export interface StationTypeDTO {
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
