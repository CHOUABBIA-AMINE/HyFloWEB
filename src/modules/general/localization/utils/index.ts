/**
 * Localization Utils Barrel Export
 * 
 * @author CHOUABBIA Amine
 * @created 01-05-2026
 * @updated 01-08-2026 - Fixed export conflicts with explicit exports
 */

// Export mapper functions (except conflicting ones)
export {
  mapToCountryDTO,
  mapFromCountryDTO,
  mapToStateDTO,
  mapFromStateDTO,
  mapToLocalityDTO,
  mapFromLocalityDTO,
  mapToLocationDTO,
  mapFromLocationDTO,
  findCountryByCode,
  // isValidCountryCode - conflicts with @/shared/utils
  // getLocalizedName - conflicts with localizationUtils
} from './localizationMapper';

// Export utility functions
export * from './localizationUtils';
