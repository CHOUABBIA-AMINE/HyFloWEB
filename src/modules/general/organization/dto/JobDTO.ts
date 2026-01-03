/**
 * Job DTO
 * Data Transfer Object for Job entity
 * Aligned with Backend: dz.sh.trc.hyflo.general.organization.dto.JobDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 12-28-2025
 * @updated 01-03-2026
 * @package common/administration
 */

import { StructureDTO } from './StructureDTO';

export interface JobDTO {
  // Identifier
  id?: number;

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
