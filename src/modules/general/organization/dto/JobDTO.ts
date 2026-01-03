/**
 * Job DTO
 * Data Transfer Object for Job entity
 * Matches: dz.mdn.iaas.common.administration.model.Job.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import { StructureDTO } from './StructureDTO';

export interface JobDTO {
  id: number;
  
  // Code (unique identifier)
  code: string;
  
  // Designations (multilingual)
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  
  // Structure relationship (required)
  structureId: number;
  structure?: StructureDTO;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
