/**
 * Localization Utilities
 * Helper functions for localization module
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

/**
 * Get localized name from an entity based on language
 * 
 * @param entity - The entity with nameAr, nameFr, nameEn properties
 * @param language - The language code (en, fr, ar)
 * @returns The localized name or fallback
 */
export function getLocalizedName(
  entity: any,
  language: string = 'en'
): string {
  if (!entity) return 'N/A';

  const lang = language.toLowerCase();
  
  if (lang === 'ar' && entity.nameAr) return entity.nameAr;
  if (lang === 'fr' && entity.nameFr) return entity.nameFr;
  if (lang === 'en' && entity.nameEn) return entity.nameEn;
  
  // Fallback to first available
  return entity.nameEn || entity.nameFr || entity.nameAr || entity.name || 'N/A';
}

/**
 * Sort array of entities by their localized names
 * 
 * @param entities - Array of entities to sort
 * @param language - The language code for sorting
 * @returns Sorted array
 */
export function sortByLocalizedName(
  entities: any[],
  language: string = 'en'
): any[] {
  if (!Array.isArray(entities)) return [];
  
  return [...entities].sort((a, b) => {
    const nameA = getLocalizedName(a, language);
    const nameB = getLocalizedName(b, language);
    return nameA.localeCompare(nameB, language === 'ar' ? 'ar' : 'en');
  });
}
