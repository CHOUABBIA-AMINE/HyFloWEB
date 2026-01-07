/**
 * Constants - General Organization Module
 * 
 * Constants for General Organization entities.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  PERSONS: '/api/general/organization/persons',
  EMPLOYEES: '/api/general/organization/employees',
  JOBS: '/api/general/organization/jobs',
  STRUCTURES: '/api/general/organization/structures',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  REGISTRATION_NUMBER_MIN_LENGTH: 3,
  REGISTRATION_NUMBER_MAX_LENGTH: 20,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESIGNATION_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  LOCALE: 'fr' as 'fr' | 'en' | 'ar',
  NAME_LOCALE: 'lt' as 'lt' | 'ar',
} as const;

/**
 * Locales
 */
export const LOCALES = {
  FRENCH: 'fr',
  ENGLISH: 'en',
  ARABIC: 'ar',
  LATIN: 'lt',
} as const;

/**
 * Sort options
 */
export const SORT_OPTIONS = {
  PERSON: [
    { value: 'lastNameLt,asc', label: 'Last Name (A-Z)' },
    { value: 'lastNameLt,desc', label: 'Last Name (Z-A)' },
    { value: 'firstNameLt,asc', label: 'First Name (A-Z)' },
    { value: 'firstNameLt,desc', label: 'First Name (Z-A)' },
  ],
  EMPLOYEE: [
    { value: 'registrationNumber,asc', label: 'Registration Number (A-Z)' },
    { value: 'registrationNumber,desc', label: 'Registration Number (Z-A)' },
    { value: 'hireDate,asc', label: 'Hire Date (Oldest)' },
    { value: 'hireDate,desc', label: 'Hire Date (Newest)' },
  ],
  STRUCTURE: [
    { value: 'code,asc', label: 'Code (A-Z)' },
    { value: 'code,desc', label: 'Code (Z-A)' },
    { value: 'designationFr,asc', label: 'Designation FR (A-Z)' },
    { value: 'designationFr,desc', label: 'Designation FR (Z-A)' },
  ],
  JOB: [
    { value: 'code,asc', label: 'Code (A-Z)' },
    { value: 'code,desc', label: 'Code (Z-A)' },
    { value: 'designationFr,asc', label: 'Designation FR (A-Z)' },
    { value: 'designationFr,desc', label: 'Designation FR (Z-A)' },
  ],
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  CODE_REQUIRED: 'Code is required',
  CODE_INVALID: 'Code format is invalid',
  REGISTRATION_NUMBER_REQUIRED: 'Registration number is required',
  REGISTRATION_NUMBER_INVALID: 'Registration number must be alphanumeric',
  NAME_REQUIRED: 'Name is required',
  NAME_INVALID: 'Name format is invalid',
  DESIGNATION_FR_REQUIRED: 'French designation is required',
  DESIGNATION_EN_REQUIRED: 'English designation is required',
  EMAIL_INVALID: 'Email format is invalid',
  PHONE_INVALID: 'Phone number format is invalid',
  BIRTH_DATE_INVALID: 'Birth date must be in the past',
  HIRE_DATE_INVALID: 'Hire date cannot be in the future',
  DATE_RANGE_INVALID: 'Start date must be before end date',
  NOT_FOUND: 'Record not found',
  ALREADY_EXISTS: 'Record already exists',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Record created successfully',
  UPDATED: 'Record updated successfully',
  DELETED: 'Record deleted successfully',
  PERSON_CREATED: 'Person created successfully',
  EMPLOYEE_CREATED: 'Employee created successfully',
  JOB_CREATED: 'Job created successfully',
  STRUCTURE_CREATED: 'Structure created successfully',
} as const;

/**
 * Entity types
 */
export const ENTITY_TYPES = {
  PERSON: 'person',
  EMPLOYEE: 'employee',
  JOB: 'job',
  STRUCTURE: 'structure',
} as const;
