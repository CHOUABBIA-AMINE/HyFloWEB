/**
 * Validation Utilities - General Organization Module
 * 
 * Validation functions for General Organization entities.
 * 
 * @author CHOUABBIA Amine
 */

import { isNotEmpty, isValidEmail } from '../../common/utils/validation';

/**
 * Validate registration number (employee)
 */
export const isValidRegistrationNumber = (regNumber: string | undefined | null): boolean => {
  if (!isNotEmpty(regNumber)) return false;
  // Registration number should be alphanumeric
  return /^[A-Z0-9-]+$/.test(regNumber!);
};

/**
 * Validate structure code
 */
export const isValidStructureCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z0-9_-]+$/.test(code!);
};

/**
 * Validate job code
 */
export const isValidJobCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z0-9_-]+$/.test(code!);
};

/**
 * Validate person name (first or last)
 */
export const isValidPersonName = (name: string | undefined | null): boolean => {
  return isNotEmpty(name);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string | undefined | null): boolean => {
  if (!phone) return true; // Optional
  // Phone should be digits, spaces, +, -, (, )
  return /^[\d\s+\-()]+$/.test(phone);
};

/**
 * Validate birth date (must be in the past)
 */
export const isValidBirthDate = (birthDate: Date | string | undefined | null): boolean => {
  if (!birthDate) return true; // Optional
  
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const now = new Date();
  
  return date < now;
};

/**
 * Validate hire date (must be in the past or today)
 */
export const isValidHireDate = (hireDate: Date | string | undefined | null): boolean => {
  if (!hireDate) return true; // Optional
  
  const date = typeof hireDate === 'string' ? new Date(hireDate) : hireDate;
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today
  
  return date <= now;
};

/**
 * Validate date range (start before end)
 */
export const isValidDateRange = (
  startDate: Date | string | undefined | null,
  endDate: Date | string | undefined | null
): boolean => {
  if (!startDate || !endDate) return true;
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return start <= end;
};

// Re-export common validations
export { isNotEmpty, isValidEmail };
