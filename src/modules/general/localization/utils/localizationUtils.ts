/**
 * Localization Utilities for State, District and Locality
 * Helper functions to get localized designations based on language
 * Uses designation fields to match backend
 * 
 * Updated: 01-16-2026 - Added District support
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 01-16-2026
 */

import { StateDTO, DistrictDTO, LocalityDTO } from '../dto';

/**
 * Get localized designation from State, District or Locality based on current language
 * @param entity - State, District or Locality DTO
 * @param language - Current language code ('ar', 'en', 'fr')
 * @returns Localized designation string
 */
export const getLocalizedName = (
  entity: StateDTO | DistrictDTO | LocalityDTO | null | undefined,
  language: string
): string => {
  if (!entity) return '';

  // Normalize language code
  const lang = language.toLowerCase().substring(0, 2);

  switch (lang) {
    case 'ar':
      return entity.designationAr || entity.designationEn || entity.designationFr || '';
    case 'fr':
      return entity.designationFr || entity.designationEn || entity.designationAr || '';
    case 'en':
    default:
      return entity.designationEn || entity.designationFr || entity.designationAr || '';
  }
};

/**
 * Sort array of States, Districts or Localities by localized designation
 * @param items - Array of State, District or Locality DTOs
 * @param language - Current language code ('ar', 'en', 'fr')
 * @returns Sorted array
 */
export const sortByLocalizedName = <T extends StateDTO | DistrictDTO | LocalityDTO>(
  items: T[],
  language: string
): T[] => {
  return [...items].sort((a, b) => {
    const nameA = getLocalizedName(a, language);
    const nameB = getLocalizedName(b, language);
    return nameA.localeCompare(nameB);
  });
};

/**
 * Filter items by localized designation search term
 * @param items - Array of State, District or Locality DTOs
 * @param searchTerm - Search term
 * @param language - Current language code ('ar', 'en', 'fr')
 * @returns Filtered array
 */
export const filterByLocalizedName = <T extends StateDTO | DistrictDTO | LocalityDTO>(
  items: T[],
  searchTerm: string,
  language: string
): T[] => {
  if (!searchTerm) return items;
  
  const lowerSearch = searchTerm.toLowerCase();
  return items.filter(item => {
    const localizedName = getLocalizedName(item, language).toLowerCase();
    const code = item.code.toLowerCase();
    return localizedName.includes(lowerSearch) || code.includes(lowerSearch);
  });
};
