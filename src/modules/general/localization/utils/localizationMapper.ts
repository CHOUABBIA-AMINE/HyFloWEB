/**
 * Localization Mapper Utilities
 * 
 * Provides mapping functions between API responses and DTOs for localization entities.
 * 
 * @author CHOUABBIA Amine
 * @created 01-05-2026
 * @updated 01-08-2026 - Fixed LocationDTO mapping per U-005 schema
 */

import {
  CountryDTO,
  StateDTO,
  LocalityDTO,
  LocationDTO,
} from '../dto';

/**
 * Maps API country data to CountryDTO
 */
export const mapToCountryDTO = (data: any): CountryDTO => {
  if (!data) return {} as CountryDTO;

  return {
    id: data.id,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    nameFr: data.nameFr,
    capital: data.capital,
    currency: data.currency,
    dialCode: data.dialCode,
    isoCode2: data.isoCode2,
    isoCode3: data.isoCode3,
  };
};

/**
 * Maps CountryDTO to API format for create/update
 */
export const mapFromCountryDTO = (data: Partial<CountryDTO>): any => {
  return {
    id: data.id,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    nameFr: data.nameFr,
    capital: data.capital,
    currency: data.currency,
    dialCode: data.dialCode,
    isoCode2: data.isoCode2,
    isoCode3: data.isoCode3,
  };
};

/**
 * Maps API state data to StateDTO
 */
export const mapToStateDTO = (data: any): StateDTO => {
  if (!data) return {} as StateDTO;

  return {
    id: data.id,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    nameFr: data.nameFr,
    countryId: data.countryId,
    country: data.country ? mapToCountryDTO(data.country) : undefined,
  };
};

/**
 * Maps StateDTO to API format for create/update
 */
export const mapFromStateDTO = (data: Partial<StateDTO>): any => {
  return {
    id: data.id,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    nameFr: data.nameFr,
    countryId: data.countryId,
  };
};

/**
 * Maps API locality data to LocalityDTO
 */
export const mapToLocalityDTO = (data: any): LocalityDTO => {
  if (!data) return {} as LocalityDTO;

  return {
    id: data.id,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    nameFr: data.nameFr,
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    stateId: data.stateId,
    state: data.state ? mapToStateDTO(data.state) : undefined,
  };
};

/**
 * Maps LocalityDTO to API format for create/update
 */
export const mapFromLocalityDTO = (data: Partial<LocalityDTO>): any => {
  return {
    id: data.id,
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    nameFr: data.nameFr,
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    stateId: data.stateId,
  };
};

/**
 * Maps API location data to LocationDTO
 * Updated per U-005 schema changes:
 * - code renamed to placeName
 * - infrastructureId removed (relationship inverted)
 */
export const mapToLocationDTO = (data: any): LocationDTO => {
  if (!data) return {} as LocationDTO;

  return {
    id: data.id,
    sequence: data.sequence,
    placeName: data.placeName,  // U-005: renamed from 'code'
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    localityId: data.localityId,
    locality: data.locality ? mapToLocalityDTO(data.locality) : undefined,
  };
};

/**
 * Maps LocationDTO to API format for create/update
 * Updated per U-005 schema changes:
 * - code renamed to placeName
 * - infrastructureId removed (relationship inverted)
 */
export const mapFromLocationDTO = (data: Partial<LocationDTO>): any => {
  return {
    id: data.id,
    sequence: data.sequence,
    placeName: data.placeName,  // U-005: renamed from 'code'
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    localityId: data.localityId,
    // U-005: infrastructureId removed - relationship inverted
  };
};

/**
 * Validates if a country code exists in a list of countries
 */
export const isValidCountryCode = (code: string, countries: CountryDTO[]): boolean => {
  return countries.some(country => country.code === code);
};

/**
 * Finds a country by code
 */
export const findCountryByCode = (code: string, countries: CountryDTO[]): CountryDTO | undefined => {
  return countries.find(country => country.code === code);
};

/**
 * Gets localized name based on current language
 */
export const getLocalizedName = (
  entity: { nameAr?: string; nameEn?: string; nameFr?: string },
  language: 'ar' | 'en' | 'fr'
): string => {
  switch (language) {
    case 'ar':
      return entity.nameAr || entity.nameEn || entity.nameFr || '';
    case 'en':
      return entity.nameEn || entity.nameFr || entity.nameAr || '';
    case 'fr':
      return entity.nameFr || entity.nameEn || entity.nameAr || '';
    default:
      return entity.nameEn || entity.nameFr || entity.nameAr || '';
  }
};
