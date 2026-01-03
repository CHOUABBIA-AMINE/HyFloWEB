/**
 * Localization Utilities for State and Locality
 * Helper functions to get localized designations based on language
 * Uses designation fields to match iaas backend
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-23-2025
 */

import { StateDTO, LocalityDTO } from '../dto';

/**
 * Get localized designation from State or Locality based on current language
 * @param entity - State or Locality DTO
 * @param language - Current language code ('ar', 'en', 'fr')
 * @returns Localized designation string
 */
export const getLocalizedName = (
  entity: StateDTO | LocalityDTO | null | undefined,
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
 * Sort array of States or Localities by localized designation
 * @param items - Array of State or Locality DTOs
 * @param language - Current language code ('ar', 'en', 'fr')
 * @returns Sorted array
 */
export const sortByLocalizedName = <T extends StateDTO | LocalityDTO>(
  items: T[],
  language: string
): T[] => {
  return [...items].sort((a, b) => {
    const nameA = getLocalizedName(a, language);
    const nameB = getLocalizedName(b, language);
    return nameA.localeCompare(nameB);
  });
};
