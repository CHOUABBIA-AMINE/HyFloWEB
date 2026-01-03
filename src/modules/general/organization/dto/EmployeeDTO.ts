/**
 * Employee DTO
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 */

export interface EmployeeDTO {
  id?: number;
  lastNameAr: string;
  firstNameAr: string;
  lastNameLt: string;
  firstNameLt: string;
  birthDate?: string;
  birthPlace?: string;
  countryId?: number;
  registrationNumber?: string;
  jobId?: number;
  structureId?: number;
  militaryRankId?: number;
}
