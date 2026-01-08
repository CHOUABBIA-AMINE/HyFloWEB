/**
 * Unified Formatter Utilities
 * 
 * Centralized formatting functions for all application modules.
 * Used across General, Network, and System modules.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * Generic formatters
 */

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate string to specified length with ellipsis
 */
export const truncate = (str: string, maxLength: number = 50): string => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Convert to uppercase
 */
export const toUpperCase = (str: string | undefined | null): string => {
  return (str || '').toUpperCase();
};

/**
 * Convert to lowercase
 */
export const toLowerCase = (str: string | undefined | null): string => {
  return (str || '').toLowerCase();
};

/**
 * Format date to locale string
 */
export const formatDate = (date: string | Date | undefined | null, locale: string = 'fr-FR'): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch {
    return '-';
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date | undefined | null, locale: string = 'fr-FR'): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
  } catch {
    return '-';
  }
};

/**
 * Localization formatters
 */

/**
 * Format designation by locale
 */
export const formatDesignation = (
  designationFr: string | undefined | null,
  designationEn: string | undefined | null,
  locale: 'fr' | 'en' = 'fr'
): string => {
  const designation = locale === 'fr' ? designationFr : designationEn;
  if (!designation) return '-';
  return toTitleCase(designation);
};

/**
 * Format country code (uppercase)
 */
export const formatCountryCode = (code: string | undefined | null): string => {
  if (!code) return '-';
  return code.toUpperCase();
};

/**
 * Format state code (uppercase)
 */
export const formatStateCode = (code: string | undefined | null): string => {
  if (!code) return '-';
  return code.toUpperCase();
};

/**
 * Format postal code
 */
export const formatPostalCode = (postalCode: string | undefined | null): string => {
  if (!postalCode) return '-';
  return postalCode.toUpperCase();
};

/**
 * Format coordinates
 */
export const formatCoordinates = (
  latitude: number | undefined | null,
  longitude: number | undefined | null,
  precision: number = 4
): string => {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return '-';
  }
  
  const lat = latitude.toFixed(precision);
  const lon = longitude.toFixed(precision);
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(Number(lat))}° ${latDir}, ${Math.abs(Number(lon))}° ${lonDir}`;
};

/**
 * Format latitude
 */
export const formatLatitude = (latitude: number | undefined | null, precision: number = 4): string => {
  if (latitude === undefined || latitude === null) return '-';
  const dir = latitude >= 0 ? 'N' : 'S';
  return `${Math.abs(latitude).toFixed(precision)}° ${dir}`;
};

/**
 * Format longitude
 */
export const formatLongitude = (longitude: number | undefined | null, precision: number = 4): string => {
  if (longitude === undefined || longitude === null) return '-';
  const dir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(longitude).toFixed(precision)}° ${dir}`;
};

/**
 * Format full address
 */
export const formatFullAddress = (
  placeName: string | undefined | null,
  localityName: string | undefined | null,
  stateName: string | undefined | null,
  countryName: string | undefined | null
): string => {
  const parts = [placeName, localityName, stateName, countryName].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '-';
};

/**
 * Format location label (code + designation)
 */
export const formatLocationLabel = (
  code: string | undefined | null,
  designation: string | undefined | null
): string => {
  if (!code && !designation) return '-';
  if (!code) return designation || '-';
  if (!designation) return code;
  return `${code} - ${designation}`;
};

/**
 * Organization formatters
 */

/**
 * Format person full name (Latin characters)
 */
export const formatPersonNameLt = (
  firstNameLt: string | undefined | null,
  lastNameLt: string | undefined | null
): string => {
  if (!firstNameLt && !lastNameLt) return '-';
  if (!firstNameLt) return toTitleCase(lastNameLt || '');
  if (!lastNameLt) return toTitleCase(firstNameLt);
  return `${toTitleCase(firstNameLt)} ${toTitleCase(lastNameLt).toUpperCase()}`;
};

/**
 * Format person full name (Arabic characters)
 */
export const formatPersonNameAr = (
  firstNameAr: string | undefined | null,
  lastNameAr: string | undefined | null
): string => {
  if (!firstNameAr && !lastNameAr) return '-';
  if (!firstNameAr) return lastNameAr || '';
  if (!lastNameAr) return firstNameAr;
  return `${firstNameAr} ${lastNameAr}`;
};

/**
 * Format full name based on locale
 */
export const formatPersonName = (
  firstNameLt: string | undefined | null,
  lastNameLt: string | undefined | null,
  firstNameAr: string | undefined | null,
  lastNameAr: string | undefined | null,
  locale: 'lt' | 'ar' = 'lt'
): string => {
  if (locale === 'ar') {
    return formatPersonNameAr(firstNameAr, lastNameAr);
  }
  return formatPersonNameLt(firstNameLt, lastNameLt);
};

/**
 * Format registration number
 */
export const formatRegistrationNumber = (regNumber: string | undefined | null): string => {
  if (!regNumber) return '-';
  return regNumber.toUpperCase();
};

/**
 * Format structure designation by locale
 */
export const formatStructureDesignation = (
  designationFr: string | undefined | null,
  designationEn: string | undefined | null,
  designationAr: string | undefined | null,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string => {
  let designation: string | undefined | null;
  
  switch (locale) {
    case 'ar':
      designation = designationAr;
      break;
    case 'en':
      designation = designationEn;
      break;
    case 'fr':
    default:
      designation = designationFr;
  }
  
  if (!designation) return '-';
  return locale === 'ar' ? designation : toTitleCase(designation);
};

/**
 * Format job designation by locale
 */
export const formatJobDesignation = (
  designationFr: string | undefined | null,
  designationEn: string | undefined | null,
  designationAr: string | undefined | null,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string => {
  return formatStructureDesignation(designationFr, designationEn, designationAr, locale);
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string | undefined | null): string => {
  if (!phone) return '-';
  // Simple formatting: remove extra spaces
  return phone.trim().replace(/\s+/g, ' ');
};

/**
 * Format employee label (reg number + name)
 */
export const formatEmployeeLabel = (
  registrationNumber: string | undefined | null,
  firstNameLt: string | undefined | null,
  lastNameLt: string | undefined | null
): string => {
  const name = formatPersonNameLt(firstNameLt, lastNameLt);
  if (!registrationNumber) return name;
  return `${formatRegistrationNumber(registrationNumber)} - ${name}`;
};

/**
 * Format structure path (for hierarchy display)
 */
export const formatStructurePath = (
  structures: Array<{ code: string; designationFr: string }>
): string => {
  if (structures.length === 0) return '-';
  return structures.map(s => `${s.code}`).join(' > ');
};
