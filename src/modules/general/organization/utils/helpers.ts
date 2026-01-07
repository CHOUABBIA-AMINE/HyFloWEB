/**
 * Helper Utilities - General Organization Module
 * 
 * Helper functions for General Organization entities.
 * 
 * @author CHOUABBIA Amine
 */

import { sortBy } from '../../common/utils/helpers';
import type { PersonDTO } from '../dto/PersonDTO';
import type { EmployeeDTO } from '../dto/EmployeeDTO';
import type { JobDTO } from '../dto/JobDTO';
import type { StructureDTO } from '../dto/StructureDTO';

/**
 * Sort persons by last name
 */
export const sortPersonsByLastName = (
  persons: PersonDTO[],
  order: 'asc' | 'desc' = 'asc'
): PersonDTO[] => {
  return sortBy(persons, 'lastNameLt' as keyof PersonDTO, order);
};

/**
 * Sort employees by registration number
 */
export const sortEmployeesByRegistrationNumber = (
  employees: EmployeeDTO[],
  order: 'asc' | 'desc' = 'asc'
): EmployeeDTO[] => {
  return sortBy(employees, 'registrationNumber' as keyof EmployeeDTO, order);
};

/**
 * Sort structures by designation
 */
export const sortStructuresByDesignation = (
  structures: StructureDTO[],
  locale: 'fr' | 'en' | 'ar' = 'fr',
  order: 'asc' | 'desc' = 'asc'
): StructureDTO[] => {
  const key = locale === 'ar' ? 'designationAr' : locale === 'en' ? 'designationEn' : 'designationFr';
  return sortBy(structures, key as keyof StructureDTO, order);
};

/**
 * Sort jobs by designation
 */
export const sortJobsByDesignation = (
  jobs: JobDTO[],
  locale: 'fr' | 'en' | 'ar' = 'fr',
  order: 'asc' | 'desc' = 'asc'
): JobDTO[] => {
  const key = locale === 'ar' ? 'designationAr' : locale === 'en' ? 'designationEn' : 'designationFr';
  return sortBy(jobs, key as keyof JobDTO, order);
};

/**
 * Find person by name
 */
export const findPersonByName = (
  persons: PersonDTO[],
  firstName: string,
  lastName: string
): PersonDTO | undefined => {
  return persons.find(
    (p) =>
      p.firstNameLt?.toLowerCase() === firstName.toLowerCase() &&
      p.lastNameLt?.toLowerCase() === lastName.toLowerCase()
  );
};

/**
 * Find employee by registration number
 */
export const findEmployeeByRegistrationNumber = (
  employees: EmployeeDTO[],
  registrationNumber: string
): EmployeeDTO | undefined => {
  return employees.find(
    (e) => e.registrationNumber?.toLowerCase() === registrationNumber.toLowerCase()
  );
};

/**
 * Find structure by code
 */
export const findStructureByCode = (
  structures: StructureDTO[],
  code: string
): StructureDTO | undefined => {
  return structures.find((s) => s.code === code);
};

/**
 * Filter structures by type
 */
export const filterStructuresByType = (
  structures: StructureDTO[],
  structureTypeId: number
): StructureDTO[] => {
  return structures.filter((s) => s.structureTypeId === structureTypeId);
};

/**
 * Filter child structures
 */
export const filterChildStructures = (
  structures: StructureDTO[],
  parentStructureId: number
): StructureDTO[] => {
  return structures.filter((s) => s.parentStructureId === parentStructureId);
};

/**
 * Get root structures (no parent)
 */
export const getRootStructures = (structures: StructureDTO[]): StructureDTO[] => {
  return structures.filter((s) => !s.parentStructureId);
};

/**
 * Filter jobs by structure
 */
export const filterJobsByStructure = (
  jobs: JobDTO[],
  structureId: number
): JobDTO[] => {
  return jobs.filter((j) => j.structureId === structureId);
};

/**
 * Filter employees by structure (through job)
 */
export const filterEmployeesByStructure = (
  employees: EmployeeDTO[],
  structureId: number
): EmployeeDTO[] => {
  return employees.filter((e) => e.job?.structureId === structureId);
};

/**
 * Create person options for dropdown
 */
export const createPersonOptions = (
  persons: PersonDTO[]
): Array<{ value: number; label: string }> => {
  return persons.map((person) => ({
    value: person.id!,
    label: `${person.firstNameLt} ${person.lastNameLt}`,
  }));
};

/**
 * Create employee options for dropdown
 */
export const createEmployeeOptions = (
  employees: EmployeeDTO[]
): Array<{ value: number; label: string; registrationNumber: string }> => {
  return employees.map((employee) => ({
    value: employee.id!,
    label: `${employee.registrationNumber} - ${employee.person?.firstNameLt} ${employee.person?.lastNameLt}`,
    registrationNumber: employee.registrationNumber,
  }));
};

/**
 * Create structure options for dropdown
 */
export const createStructureOptions = (
  structures: StructureDTO[],
  locale: 'fr' | 'en' | 'ar' = 'fr'
): Array<{ value: number; label: string; code: string }> => {
  const designationKey = locale === 'ar' ? 'designationAr' : locale === 'en' ? 'designationEn' : 'designationFr';
  
  return structures.map((structure) => ({
    value: structure.id!,
    label: `${structure.code} - ${structure[designationKey]}`,
    code: structure.code,
  }));
};

/**
 * Create job options for dropdown
 */
export const createJobOptions = (
  jobs: JobDTO[],
  locale: 'fr' | 'en' | 'ar' = 'fr'
): Array<{ value: number; label: string; code: string }> => {
  const designationKey = locale === 'ar' ? 'designationAr' : locale === 'en' ? 'designationEn' : 'designationFr';
  
  return jobs.map((job) => ({
    value: job.id!,
    label: `${job.code} - ${job[designationKey]}`,
    code: job.code,
  }));
};

/**
 * Build structure hierarchy tree
 */
export const buildStructureTree = (
  structures: StructureDTO[],
  parentId: number | null = null
): StructureDTO[] => {
  return structures
    .filter((s) => s.parentStructureId === parentId)
    .map((structure) => ({
      ...structure,
      children: buildStructureTree(structures, structure.id!),
    }));
};

/**
 * Get structure path (from root to current)
 */
export const getStructurePath = (
  structures: StructureDTO[],
  structureId: number
): StructureDTO[] => {
  const path: StructureDTO[] = [];
  let currentId: number | null = structureId;
  
  while (currentId) {
    const structure = structures.find((s) => s.id === currentId);
    if (!structure) break;
    
    path.unshift(structure);
    currentId = structure.parentStructureId || null;
  }
  
  return path;
};

/**
 * Group employees by structure
 */
export const groupEmployeesByStructure = (
  employees: EmployeeDTO[]
): Record<number, EmployeeDTO[]> => {
  return employees.reduce((acc, employee) => {
    const structureId = employee.job?.structureId;
    if (structureId) {
      if (!acc[structureId]) {
        acc[structureId] = [];
      }
      acc[structureId].push(employee);
    }
    return acc;
  }, {} as Record<number, EmployeeDTO[]>);
};

/**
 * Group jobs by structure
 */
export const groupJobsByStructure = (
  jobs: JobDTO[]
): Record<number, JobDTO[]> => {
  return jobs.reduce((acc, job) => {
    const structureId = job.structureId;
    if (!acc[structureId]) {
      acc[structureId] = [];
    }
    acc[structureId].push(job);
    return acc;
  }, {} as Record<number, JobDTO[]>);
};

// Re-export common helpers
export { sortBy };
