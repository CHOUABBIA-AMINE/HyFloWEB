/**
 * Unified Validation Utilities
 * 
 * Centralized validation functions for all application modules.
 * Used across General, Network, and System modules.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * Generic value validators
 */

/**
 * Check if value is not empty
 */
export const isNotEmpty = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

/**
 * Check if value is empty
 */
export const isEmpty = (value: string | undefined | null): boolean => {
  return !isNotEmpty(value);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Localization validators
 */

/**
 * Validate country code (ISO format: 2-3 uppercase letters)
 */
export const isValidCountryCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z]{2,3}$/.test(code!);
};

/**
 * Validate state code
 */
export const isValidStateCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z0-9]{2,5}$/.test(code!);
};

/**
 * Validate locality code
 */
export const isValidLocalityCode = (code: string | undefined | null): boolean => {
  return isNotEmpty(code);
};

/**
 * Validate zone code
 */
export const isValidZoneCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z0-9_-]+$/.test(code!);
};

/**
 * Validate postal code
 */
export const isValidPostalCode = (postalCode: string | undefined | null): boolean => {
  if (!postalCode) return true; // Optional
  return /^[A-Z0-9\s-]{3,10}$/.test(postalCode);
};

/**
 * Validate latitude
 */
export const isValidLatitude = (latitude: number | undefined | null): boolean => {
  if (latitude === undefined || latitude === null) return true; // Optional
  return latitude >= -90 && latitude <= 90;
};

/**
 * Validate longitude
 */
export const isValidLongitude = (longitude: number | undefined | null): boolean => {
  if (longitude === undefined || longitude === null) return true; // Optional
  return longitude >= -180 && longitude <= 180;
};

/**
 * Validate coordinates (latitude and longitude)
 */
export const isValidCoordinates = (
  latitude: number | undefined | null,
  longitude: number | undefined | null
): boolean => {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
};

/**
 * Validate designation (French or English)
 */
export const isValidDesignation = (designation: string | undefined | null): boolean => {
  return isNotEmpty(designation);
};

/**
 * Validate place name
 */
export const isValidPlaceName = (placeName: string | undefined | null): boolean => {
  return isNotEmpty(placeName);
};

/**
 * Organization validators
 */

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
 * Date validators
 */

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

/**
 * Validate date is not in future
 */
export const isValidPastDate = (date: Date | string | undefined | null): boolean => {
  if (!date) return true; // Optional
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return dateObj <= now;
};
