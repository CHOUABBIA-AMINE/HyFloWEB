/**
 * Person DTO
 * Data Transfer Object for Person entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 */

import { LocalityDTO } from './LocalityDTO';
import { MilitaryRankDTO } from './MilitaryRankDTO';

export interface PersonDTO {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  localityId?: number;
  locality?: LocalityDTO;
  militaryRankId?: number;
  militaryRank?: MilitaryRankDTO;
  createdAt?: string;
  updatedAt?: string;
}
