/**
 * Helper Utilities - General Localization Module
 * 
 * Helper functions for General Localization entities.
 * 
 * @author CHOUABBIA Amine
 */

import type { CountryDTO } from '../dto/CountryDTO';
import type { StateDTO } from '../dto/StateDTO';
import type { LocalityDTO } from '../dto/LocalityDTO';
import type { LocationDTO } from '../dto/LocationDTO';
import type { ZoneDTO } from '../dto/ZoneDTO';

/**
 * Generic sortBy helper function
 * Sorts an array of objects by a given key
 */
export const sortBy = <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : 1;
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Sort countries by designation
 */
export const sortCountriesByDesignation = (
  countries: CountryDTO[],
  locale: 'fr' | 'en' = 'fr',
  order: 'asc' | 'desc' = 'asc'
): CountryDTO[] => {
  const key = locale === 'fr' ? 'designationFr' : 'designationEn';
  return sortBy(countries, key as keyof CountryDTO, order);
};

/**
 * Sort states by designation
 */
export const sortStatesByDesignation = (
  states: StateDTO[],
  locale: 'fr' | 'en' = 'fr',
  order: 'asc' | 'desc' = 'asc'
): StateDTO[] => {
  const key = locale === 'fr' ? 'designationFr' : 'designationEn';
  return sortBy(states, key as keyof StateDTO, order);
};

/**
 * Sort localities by designation
 */
export const sortLocalitiesByDesignation = (
  localities: LocalityDTO[],
  locale: 'fr' | 'en' = 'fr',
  order: 'asc' | 'desc' = 'asc'
): LocalityDTO[] => {
  const key = locale === 'fr' ? 'designationFr' : 'designationEn';
  return sortBy(localities, key as keyof LocalityDTO, order);
};

/**
 * Find country by code
 */
export const findCountryByCode = (
  countries: CountryDTO[],
  code: string
): CountryDTO | undefined => {
  return countries.find(country => country.code === code);
};

/**
 * Find state by code
 */
export const findStateByCode = (
  states: StateDTO[],
  code: string
): StateDTO | undefined => {
  return states.find(state => state.code === code);
};

/**
 * Filter states by country
 */
export const filterStatesByCountry = (
  states: StateDTO[],
  countryId: number
): StateDTO[] => {
  return states.filter(state => state.countryId === countryId);
};

/**
 * Filter localities by state
 */
export const filterLocalitiesByState = (
  localities: LocalityDTO[],
  stateId: number
): LocalityDTO[] => {
  return localities.filter(locality => locality.stateId === stateId);
};

/**
 * Filter locations by locality
 */
export const filterLocationsByLocality = (
  locations: LocationDTO[],
  localityId: number
): LocationDTO[] => {
  return locations.filter(location => location.localityId === localityId);
};

/**
 * Create country options for dropdown
 */
export const createCountryOptions = (
  countries: CountryDTO[],
  locale: 'fr' | 'en' = 'fr'
): Array<{ value: number; label: string; code: string }> => {
  return countries.map(country => ({
    value: country.id!,
    label: locale === 'fr' ? country.designationFr : country.designationEn || '',
    code: country.code,
  }));
};

/**
 * Create state options for dropdown
 */
export const createStateOptions = (
  states: StateDTO[],
  locale: 'fr' | 'en' = 'fr'
): Array<{ value: number; label: string; code: string }> => {
  return states.map(state => ({
    value: state.id!,
    label: locale === 'fr' ? state.designationFr : state.designationEn || '',
    code: state.code,
  }));
};

/**
 * Create locality options for dropdown
 */
export const createLocalityOptions = (
  localities: LocalityDTO[],
  locale: 'fr' | 'en' = 'fr'
): Array<{ value: number; label: string; code: string }> => {
  return localities.map(locality => ({
    value: locality.id!,
    label: locale === 'fr' ? locality.designationFr : locality.designationEn || '',
    code: locality.code,
  }));
};

/**
 * Create zone options for dropdown
 */
export const createZoneOptions = (
  zones: ZoneDTO[],
  locale: 'fr' | 'en' = 'fr'
): Array<{ value: number; label: string; code: string }> => {
  return zones.map(zone => ({
    value: zone.id!,
    label: locale === 'fr' ? zone.designationFr : zone.designationEn || '',
    code: zone.code,
  }));
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find nearest location to given coordinates
 */
export const findNearestLocation = (
  locations: LocationDTO[],
  latitude: number,
  longitude: number
): LocationDTO | undefined => {
  if (locations.length === 0) return undefined;
  
  let nearest = locations[0];
  let minDistance = Infinity;
  
  for (const location of locations) {
    if (location.latitude !== null && location.longitude !== null) {
      const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    }
  }
  
  return nearest;
};

/**
 * Group locations by locality
 */
export const groupLocationsByLocality = (
  locations: LocationDTO[]
): Record<number, LocationDTO[]> => {
  return locations.reduce((acc, location) => {
    const localityId = location.localityId;
    if (!acc[localityId]) {
      acc[localityId] = [];
    }
    acc[localityId].push(location);
    return acc;
  }, {} as Record<number, LocationDTO[]>);
};
