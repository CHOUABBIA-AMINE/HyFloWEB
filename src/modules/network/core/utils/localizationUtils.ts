/**
 * Localization Utility Functions
 * Helper functions for displaying multilingual content
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 */

export interface MultilingualEntity {
  designationAr?: string;
  designationEn?: string;
  designationFr?: string;
  name?: string;
}

/**
 * Get the localized name based on current language
 * @param entity Entity with multilingual fields
 * @param language Current language code (ar, en, fr)
 * @returns Localized name or fallback
 */
export const getLocalizedName = (entity: MultilingualEntity, language: string): string => {
  if (!entity) return '';
  
  switch (language) {
    case 'ar':
      return entity.designationAr || entity.designationEn || entity.designationFr || entity.name || '';
    case 'fr':
      return entity.designationFr || entity.designationEn || entity.designationAr || entity.name || '';
    case 'en':
    default:
      return entity.designationEn || entity.designationFr || entity.designationAr || entity.name || '';
  }
};

/**
 * Sort entities by their localized names
 * @param entities Array of entities to sort
 * @param language Current language code
 * @returns Sorted array
 */
export const sortByLocalizedName = <T extends MultilingualEntity>(
  entities: T[],
  language: string
): T[] => {
  return [...entities].sort((a, b) => {
    const nameA = getLocalizedName(a, language).toLowerCase();
    const nameB = getLocalizedName(b, language).toLowerCase();
    return nameA.localeCompare(nameB);
  });
};
