/**
 * Helper Utilities - Network Type Module
 * 
 * Helper functions for Network Type entities.
 * 
 * @author CHOUABBIA Amine
 */

import type { Page } from '@/types/pagination';

/**
 * Group types by category
 */
export const groupByCategory = <T extends { category?: string }>(
  types: T[]
): Record<string, T[]> => {
  return types.reduce((acc, type) => {
    const category = type.category || 'UNCATEGORIZED';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Sort types by designation (French)
 */
export const sortByDesignationFr = <T extends { designationFr?: string }>(
  types: T[]
): T[] => {
  return [...types].sort((a, b) => {
    const desigA = a.designationFr || '';
    const desigB = b.designationFr || '';
    return desigA.localeCompare(desigB, 'fr');
  });
};

/**
 * Sort types by designation (English)
 */
export const sortByDesignationEn = <T extends { designationEn?: string }>(
  types: T[]
): T[] => {
  return [...types].sort((a, b) => {
    const desigA = a.designationEn || '';
    const desigB = b.designationEn || '';
    return desigA.localeCompare(desigB, 'en');
  });
};

/**
 * Sort types by code
 */
export const sortByCode = <T extends { code?: string }>(
  types: T[]
): T[] => {
  return [...types].sort((a, b) => {
    const codeA = a.code || '';
    const codeB = b.code || '';
    return codeA.localeCompare(codeB);
  });
};

/**
 * Filter types by search term (searches in code, designationFr, designationEn)
 */
export const filterTypesBySearch = <
  T extends { code?: string; designationFr?: string; designationEn?: string }
>(
  types: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm || searchTerm.trim() === '') return types;
  
  const term = searchTerm.toLowerCase();
  return types.filter((type) => {
    const code = (type.code || '').toLowerCase();
    const designationFr = (type.designationFr || '').toLowerCase();
    const designationEn = (type.designationEn || '').toLowerCase();
    
    return (
      code.includes(term) ||
      designationFr.includes(term) ||
      designationEn.includes(term)
    );
  });
};

/**
 * Get type by code
 */
export const findTypeByCode = <T extends { code?: string }>(
  types: T[],
  code: string
): T | undefined => {
  return types.find((type) => type.code === code);
};

/**
 * Get type by designation (French)
 */
export const findTypeByDesignationFr = <T extends { designationFr?: string }>(
  types: T[],
  designation: string
): T | undefined => {
  return types.find((type) => type.designationFr === designation);
};

/**
 * Convert types array to select options
 */
export const typesToSelectOptions = <
  T extends { id?: number; code?: string; designationFr?: string }
>(
  types: T[],
  labelField: 'code' | 'designationFr' = 'designationFr'
): Array<{ value: number; label: string }> => {
  return types
    .filter((type) => type.id !== undefined)
    .map((type) => ({
      value: type.id!,
      label: labelField === 'code' ? (type.code || '') : (type.designationFr || ''),
    }));
};

/**
 * Check if type exists by code
 */
export const typeExistsByCode = <T extends { code?: string }>(
  types: T[],
  code: string
): boolean => {
  return types.some((type) => type.code === code);
};

/**
 * Get unique categories from types
 */
export const getUniqueCategories = <T extends { category?: string }>(
  types: T[]
): string[] => {
  const categories = types.map((type) => type.category || 'UNCATEGORIZED');
  return Array.from(new Set(categories)).sort();
};
