/**
 * General Organization Services - Barrel Export
 * 
 * All services for the General Organization module.
 * These services provide API communication for organizational entities.
 * 
 * Organizational Hierarchy:
 * Structure (can have parent-child relationships)
 *   └─> Job (positions within structures)
 *        └─> Employee (persons assigned to jobs)
 * 
 * Person (independent, can become Employee)
 */

// Export classes (for type checking and class usage)
export * from './PersonService';
export * from './EmployeeService';
export * from './JobService';
export * from './StructureService';

// Export lowercase instances for convenient usage in components
import { PersonService } from './PersonService';
import { EmployeeService } from './EmployeeService';
import { JobService } from './JobService';
import { StructureService } from './StructureService';

export const personService = PersonService;
export const employeeService = EmployeeService;
export const jobService = JobService;
export const structureService = StructureService;
