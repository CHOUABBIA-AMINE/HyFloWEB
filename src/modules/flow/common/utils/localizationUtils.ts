/**
 * Localization Utilities - Flow Common Module
 * 
 * Helper functions for handling multilingual content in Flow Common entities.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import type { ValidationStatusDTO } from '../dto/ValidationStatusDTO';
import type { AlertStatusDTO } from '../dto/AlertStatusDTO';
import type { EventStatusDTO } from '../dto/EventStatusDTO';
import type { SeverityDTO } from '../dto/SeverityDTO';
import type { QualityFlagDTO } from '../dto/QualityFlagDTO';
import type { DataSourceDTO } from '../dto/DataSourceDTO';

/**
 * Supported languages
 */
export type Language = 'ar' | 'fr' | 'en';

/**
 * Base interface for entities with designation fields
 */
interface LocalizedDesignationEntity {
  designationFr?: string;
  designationEn?: string;
  designationAr?: string;
}

/**
 * Get localized designation from any common status/type DTO
 */
export function getLocalizedDesignation(
  entity: LocalizedDesignationEntity,
  language: Language = 'fr'
): string {
  switch (language) {
    case 'ar':
      return entity.designationAr || entity.designationFr || entity.designationEn || '';
    case 'en':
      return entity.designationEn || entity.designationFr || entity.designationAr || '';
    case 'fr':
    default:
      return entity.designationFr || entity.designationEn || entity.designationAr || '';
  }
}

/**
 * Get localized description from any common status/type DTO
 */
export function getLocalizedDescription(
  entity: {
    descriptionFr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
  },
  language: Language = 'fr'
): string {
  switch (language) {
    case 'ar':
      return entity.descriptionAr || entity.descriptionFr || entity.descriptionEn || '';
    case 'en':
      return entity.descriptionEn || entity.descriptionFr || entity.descriptionAr || '';
    case 'fr':
    default:
      return entity.descriptionFr || entity.descriptionEn || entity.descriptionAr || '';
  }
}

/**
 * Check if entity has all required translations
 */
export function hasAllTranslations(entity: LocalizedDesignationEntity): boolean {
  return !!(
    entity.designationFr &&
    entity.designationEn &&
    entity.designationAr
  );
}

/**
 * Get missing translations for an entity
 */
export function getMissingTranslations(entity: LocalizedDesignationEntity): Language[] {
  const missing: Language[] = [];
  if (!entity.designationFr) missing.push('fr');
  if (!entity.designationEn) missing.push('en');
  if (!entity.designationAr) missing.push('ar');
  return missing;
}

/**
 * Specific helpers for each DTO type
 */
export const ValidationStatusUtils = {
  getDesignation: (entity: ValidationStatusDTO, language: Language = 'fr') =>
    getLocalizedDesignation(entity, language),
  getDescription: (entity: ValidationStatusDTO, language: Language = 'fr') =>
    getLocalizedDescription(entity, language),
  hasAllTranslations: (entity: ValidationStatusDTO) => hasAllTranslations(entity),
  getMissingTranslations: (entity: ValidationStatusDTO) => getMissingTranslations(entity),
};

export const AlertStatusUtils = {
  getDesignation: (entity: AlertStatusDTO, language: Language = 'fr') =>
    getLocalizedDesignation(entity, language),
  hasAllTranslations: (entity: AlertStatusDTO) => hasAllTranslations(entity),
  getMissingTranslations: (entity: AlertStatusDTO) => getMissingTranslations(entity),
};

export const EventStatusUtils = {
  getDesignation: (entity: EventStatusDTO, language: Language = 'fr') =>
    getLocalizedDesignation(entity, language),
  getDescription: (entity: EventStatusDTO, language: Language = 'fr') =>
    getLocalizedDescription(entity, language),
  hasAllTranslations: (entity: EventStatusDTO) => hasAllTranslations(entity),
  getMissingTranslations: (entity: EventStatusDTO) => getMissingTranslations(entity),
};

export const SeverityUtils = {
  getDesignation: (entity: SeverityDTO, language: Language = 'fr') =>
    getLocalizedDesignation(entity, language),
  getDescription: (entity: SeverityDTO, language: Language = 'fr') =>
    getLocalizedDescription(entity, language),
  hasAllTranslations: (entity: SeverityDTO) => hasAllTranslations(entity),
  getMissingTranslations: (entity: SeverityDTO) => getMissingTranslations(entity),
};

export const QualityFlagUtils = {
  getDesignation: (entity: QualityFlagDTO, language: Language = 'fr') =>
    getLocalizedDesignation(entity, language),
  getDescription: (entity: QualityFlagDTO, language: Language = 'fr') =>
    getLocalizedDescription(entity, language),
  hasAllTranslations: (entity: QualityFlagDTO) => hasAllTranslations(entity),
  getMissingTranslations: (entity: QualityFlagDTO) => getMissingTranslations(entity),
};

export const DataSourceUtils = {
  getDesignation: (entity: DataSourceDTO, language: Language = 'fr') =>
    getLocalizedDesignation(entity, language),
  getDescription: (entity: DataSourceDTO, language: Language = 'fr') =>
    getLocalizedDescription(entity, language),
  hasAllTranslations: (entity: DataSourceDTO) => hasAllTranslations(entity),
  getMissingTranslations: (entity: DataSourceDTO) => getMissingTranslations(entity),
};
