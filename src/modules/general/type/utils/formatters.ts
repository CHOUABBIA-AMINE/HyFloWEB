/**
 * Formatter Utilities - General Type Module
 * 
 * Formatting functions for General Type entities.
 * 
 * @author CHOUABBIA Amine
 */

import { toTitleCase, truncate } from '../../common/utils/formatters';

/**
 * Format structure type designation
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
 * Format type code
 */
export const formatTypeCode = (code: string | undefined | null): string => {
  if (!code) return '-';
  return code.toUpperCase();
};

/**
 * Format description with truncation
 */
export const formatDescription = (
  description: string | undefined | null,
  maxLength: number = 100
): string => {
  if (!description) return '-';
  return truncate(description, maxLength);
};

/**
 * Format structure type label (code + designation)
 */
export const formatStructureTypeLabel = (
  code: string | undefined | null,
  designation: string | undefined | null
): string => {
  if (!code && !designation) return '-';
  if (!code) return designation || '-';
  if (!designation) return code;
  return `${code} - ${designation}`;
};

// Re-export common formatters
export { toTitleCase, truncate };
