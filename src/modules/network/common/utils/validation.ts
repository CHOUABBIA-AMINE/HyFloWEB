/**
 * Validation Utilities - Network Common Module
 * 
 * Common validation functions for Network Common entities.
 * Provides reusable validation logic for DTOs.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * Validates if a string is not empty
 */
export const isNotEmpty = (value?: string | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

/**
 * Validates if a number is positive
 */
export const isPositive = (value?: number | null): boolean => {
  return value !== undefined && value !== null && value > 0;
};

/**
 * Validates if a number is non-negative
 */
export const isNonNegative = (value?: number | null): boolean => {
  return value !== undefined && value !== null && value >= 0;
};

/**
 * Validates if a string matches a pattern
 */
export const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

/**
 * Validates if a value is within a range
 */
export const isInRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};

/**
 * Validates if a string length is within limits
 */
export const isLengthValid = (
  value: string,
  min: number,
  max: number
): boolean => {
  return value.length >= min && value.length <= max;
};

/**
 * Validates if a code format is valid (alphanumeric with hyphens/underscores)
 */
export const isValidCode = (code: string): boolean => {
  return /^[A-Za-z0-9_-]+$/.test(code);
};

/**
 * Validates if an email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates if a phone number format is valid
 */
export const isValidPhone = (phone: string): boolean => {
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(
    phone
  );
};

/**
 * Validates if a URL format is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
