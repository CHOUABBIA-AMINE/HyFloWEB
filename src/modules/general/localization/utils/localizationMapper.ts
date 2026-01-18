/**
 * Localization Mapper Utilities
 * 
 * Provides mapping functions between API responses and DTOs for localization entities.
 * 
 * Updated: 01-16-2026 - Added District mappers, fixed Locality hierarchy
 * 
 * @author CHOUABBIA Amine
 * @created 01-05-2026
 * @updated 01-16-2026
 */

import {
  CountryDTO,
  StateDTO,
  DistrictDTO,
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
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
  };
};

/**
 * Maps CountryDTO to API format for create/update
 */
export const mapFromCountryDTO = (data: Partial<CountryDTO>): any => {
  return {
    id: data.id,
    code: data.code,
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
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
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
  };
};

/**
 * Maps StateDTO to API format for create/update
 */
export const mapFromStateDTO = (data: Partial<StateDTO>): any => {
  return {
    id: data.id,
    code: data.code,
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
  };
};

/**
 * Maps API district data to DistrictDTO
 * Hierarchy: State → District → Locality
 */
export const mapToDistrictDTO = (data: any): DistrictDTO => {
  if (!data) return {} as DistrictDTO;

  return {
    id: data.id,
    code: data.code,
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
    stateId: data.stateId,
    state: data.state ? mapToStateDTO(data.state) : undefined,
  };
};

/**
 * Maps DistrictDTO to API format for create/update
 */
export const mapFromDistrictDTO = (data: Partial<DistrictDTO>): any => {
  return {
    id: data.id,
    code: data.code,
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
    stateId: data.stateId,
  };
};

/**
 * Maps API locality data to LocalityDTO
 * Updated: Locality belongs to District (has districtId, not stateId)
 * Hierarchy: State → District → Locality
 */
export const mapToLocalityDTO = (data: any): LocalityDTO => {
  if (!data) return {} as LocalityDTO;

  return {
    id: data.id,
    code: data.code,
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
    districtId: data.districtId,  // Fixed: Locality has districtId, not stateId
    district: data.district ? mapToDistrictDTO(data.district) : undefined,
  };
};

/**
 * Maps LocalityDTO to API format for create/update
 * Updated: Locality belongs to District (has districtId, not stateId)
 */
export const mapFromLocalityDTO = (data: Partial<LocalityDTO>): any => {
  return {
    id: data.id,
    code: data.code,
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
    districtId: data.districtId,  // Fixed: Locality has districtId, not stateId
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
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
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
    designationAr: data.designationAr,
    designationEn: data.designationEn,
    designationFr: data.designationFr,
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    localityId: data.localityId,
    // U-005: infrastructureId removed - relationship inverted
  };
};

/**
 * Finds a country by code
 */
export const findCountryByCode = (code: string, countries: CountryDTO[]): CountryDTO | undefined => {
  return countries.find(country => country.code === code);
};

/**
 * Finds a state by code
 */
export const findStateByCode = (code: string, states: StateDTO[]): StateDTO | undefined => {
  return states.find(state => state.code === code);
};

/**
 * Finds a district by code
 */
export const findDistrictByCode = (code: string, districts: DistrictDTO[]): DistrictDTO | undefined => {
  return districts.find(district => district.code === code);
};

/**
 * Finds a locality by code
 */
export const findLocalityByCode = (code: string, localities: LocalityDTO[]): LocalityDTO | undefined => {
  return localities.find(locality => locality.code === code);
};
