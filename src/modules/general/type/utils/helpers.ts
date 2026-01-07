/**
 * Helper Utilities - General Type Module
 * 
 * Helper functions for General Type entities.
 * 
 * @author CHOUABBIA Amine
 */

import { sortBy, groupBy } from '../../common/utils/helpers';
import type { StructureTypeDTO } from '../dto/StructureTypeDTO';

/**
 * Sort structure types by designation
 */
export const sortByDesignation = (
  types: StructureTypeDTO[],
  locale: 'fr' | 'en' = 'fr',
  order: 'asc' | 'desc' = 'asc'
): StructureTypeDTO[] => {
  const key = locale === 'fr' ? 'designationFr' : 'designationEn';
  return sortBy(types, key as keyof StructureTypeDTO, order);
};

/**
 * Sort structure types by code
 */
export const sortByCode = (
  types: StructureTypeDTO[],
  order: 'asc' | 'desc' = 'asc'
): StructureTypeDTO[] => {
  return sortBy(types, 'code' as keyof StructureTypeDTO, order);
};

/**
 * Filter active structure types
 */
export const getActiveTypes = (
  types: StructureTypeDTO[]
): StructureTypeDTO[] => {
  return types.filter(type => type.isActive !== false);
};

/**
 * Find structure type by code
 */
export const findByCode = (
  types: StructureTypeDTO[],
  code: string
): StructureTypeDTO | undefined => {
  return types.find(type => type.code === code);
};

/**
 * Find structure type by designation
 */
export const findByDesignation = (
  types: StructureTypeDTO[],
  designation: string,
  locale: 'fr' | 'en' = 'fr'
): StructureTypeDTO | undefined => {
  return types.find(type => {
    const typeDesignation = locale === 'fr' ? type.designationFr : type.designationEn;
    return typeDesignation?.toLowerCase() === designation.toLowerCase();
  });
};

/**
 * Group structure types by category (if applicable)
 */
export const groupByCategory = (
  types: StructureTypeDTO[]
): Record<string, StructureTypeDTO[]> => {
  // If structure types have a category field, group by it
  // Otherwise return all in 'default' category
  return { default: types };
};

/**
 * Create type options for dropdown/select
 */
export const createTypeOptions = (
  types: StructureTypeDTO[],
  locale: 'fr' | 'en' = 'fr'
): Array<{ value: number; label: string }> => {
  return types.map(type => ({
    value: type.id!,
    label: locale === 'fr' ? type.designationFr : type.designationEn || '',
  }));
};

/**
 * Filter structure types by search term
 */
export const filterBySearchTerm = (
  types: StructureTypeDTO[],
  searchTerm: string,
  locale: 'fr' | 'en' = 'fr'
): StructureTypeDTO[] => {
  if (!searchTerm) return types;
  
  const term = searchTerm.toLowerCase();
  return types.filter(type => {
    const designation = locale === 'fr' ? type.designationFr : type.designationEn;
    return (
      type.code?.toLowerCase().includes(term) ||
      designation?.toLowerCase().includes(term) ||
      type.description?.toLowerCase().includes(term)
    );
  });
};

// Re-export common helpers
export { sortBy, groupBy };
