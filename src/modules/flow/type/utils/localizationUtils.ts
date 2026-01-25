/**
 * Localization Utilities - Flow Type Module
 * 
 * Helper functions for handling multilingual content in Flow Type entities.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import type { OperationTypeDTO } from '../dto/OperationTypeDTO';
import type { EventTypeDTO } from '../dto/EventTypeDTO';

/**
 * Supported languages
 */
export type Language = 'ar' | 'fr' | 'en';

/**
 * Get localized name from OperationTypeDTO based on current language
 */
export function getLocalizedOperationTypeName(
  operationType: OperationTypeDTO,
  language: Language = 'fr'
): string {
  switch (language) {
    case 'ar':
      return operationType.nameAr || operationType.nameFr || operationType.nameEn || '';
    case 'en':
      return operationType.nameEn || operationType.nameFr || operationType.nameAr || '';
    case 'fr':
    default:
      return operationType.nameFr || operationType.nameEn || operationType.nameAr || '';
  }
}

/**
 * Get localized designation from EventTypeDTO based on current language
 */
export function getLocalizedEventTypeDesignation(
  eventType: EventTypeDTO,
  language: Language = 'fr'
): string {
  switch (language) {
    case 'ar':
      return eventType.designationAr || eventType.designationFr || eventType.designationEn || '';
    case 'en':
      return eventType.designationEn || eventType.designationFr || eventType.designationAr || '';
    case 'fr':
    default:
      return eventType.designationFr || eventType.designationEn || eventType.designationAr || '';
  }
}

/**
 * Check if OperationTypeDTO has all required translations
 */
export function hasAllOperationTypeTranslations(operationType: OperationTypeDTO): boolean {
  return !!(
    operationType.nameFr &&
    operationType.nameEn &&
    operationType.nameAr
  );
}

/**
 * Check if EventTypeDTO has all required translations
 */
export function hasAllEventTypeTranslations(eventType: EventTypeDTO): boolean {
  return !!(
    eventType.designationFr &&
    eventType.designationEn &&
    eventType.designationAr
  );
}

/**
 * Get missing translations for OperationTypeDTO
 */
export function getMissingOperationTypeTranslations(operationType: OperationTypeDTO): Language[] {
  const missing: Language[] = [];
  if (!operationType.nameFr) missing.push('fr');
  if (!operationType.nameEn) missing.push('en');
  if (!operationType.nameAr) missing.push('ar');
  return missing;
}

/**
 * Get missing translations for EventTypeDTO
 */
export function getMissingEventTypeTranslations(eventType: EventTypeDTO): Language[] {
  const missing: Language[] = [];
  if (!eventType.designationFr) missing.push('fr');
  if (!eventType.designationEn) missing.push('en');
  if (!eventType.designationAr) missing.push('ar');
  return missing;
}
