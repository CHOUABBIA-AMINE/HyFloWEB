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

export * from './PersonService';
export * from './EmployeeService';
export * from './JobService';
export * from './StructureService';
