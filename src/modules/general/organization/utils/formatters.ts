/**
 * Formatter Utilities - General Organization Module
 * 
 * Formatting functions for General Organization entities.
 * 
 * @author CHOUABBIA Amine
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
