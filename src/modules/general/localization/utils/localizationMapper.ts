/**
 * Localization Mapper - Backend to Frontend DTO conversion
 * 
 * Handles transformation between backend JSON responses and frontend TypeScript interfaces
 * Updated: 01-07-2026 - Aligned with cleaned DTOs matching exact backend structure
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 */

import { CountryDTO, StateDTO, LocalityDTO, ZoneDTO, LocationDTO } from '../dto';

export class LocalizationMapper {
  
  // ============== COUNTRY ==============
  
  /**
   * Maps backend Country response to frontend CountryDTO
   * @param data - Raw backend response data
   * @returns Mapped CountryDTO
   */
  static mapToCountryDTO(data: any): CountryDTO {
    return {
      id: data.id,
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
    };
  }

  /**
   * Maps frontend CountryDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromCountryDTO(data: Partial<CountryDTO>): Record<string, any> {
    return {
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
    };
  }

  /**
   * Maps array of backend countries to frontend DTOs
   * @param data - Array of backend country objects
   * @returns Array of CountryDTO
   */
  static mapCountriesArray(data: any[]): CountryDTO[] {
    return data.map(item => this.mapToCountryDTO(item));
  }

  // ============== STATE ==============

  /**
   * Maps backend State response to frontend StateDTO
   * @param data - Raw backend response data
   * @returns Mapped StateDTO
   */
  static mapToStateDTO(data: any): StateDTO {
    return {
      id: data.id,
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
    };
  }

  /**
   * Maps frontend StateDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromStateDTO(data: Partial<StateDTO>): Record<string, any> {
    return {
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
    };
  }

  /**
   * Maps array of backend states to frontend DTOs
   * @param data - Array of backend state objects
   * @returns Array of StateDTO
   */
  static mapStatesArray(data: any[]): StateDTO[] {
    return data.map(item => this.mapToStateDTO(item));
  }

  // ============== LOCALITY ==============

  /**
   * Maps backend Locality response to frontend LocalityDTO
   * @param data - Raw backend response data
   * @returns Mapped LocalityDTO
   */
  static mapToLocalityDTO(data: any): LocalityDTO {
    return {
      id: data.id,
      code: data.code,
      stateId: data.stateId,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
      state: data.state ? this.mapToStateDTO(data.state) : undefined,
    };
  }

  /**
   * Maps frontend LocalityDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromLocalityDTO(data: Partial<LocalityDTO>): Record<string, any> {
    return {
      code: data.code,
      stateId: data.stateId,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
    };
  }

  /**
   * Maps array of backend localities to frontend DTOs
   * @param data - Array of backend locality objects
   * @returns Array of LocalityDTO
   */
  static mapLocalitiesArray(data: any[]): LocalityDTO[] {
    return data.map(item => this.mapToLocalityDTO(item));
  }

  // ============== ZONE ==============

  /**
   * Maps backend Zone response to frontend ZoneDTO
   * @param data - Raw backend response data
   * @returns Mapped ZoneDTO
   */
  static mapToZoneDTO(data: any): ZoneDTO {
    return {
      id: data.id,
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
    };
  }

  /**
   * Maps frontend ZoneDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromZoneDTO(data: Partial<ZoneDTO>): Record<string, any> {
    return {
      code: data.code,
      designationAr: data.designationAr,
      designationEn: data.designationEn,
      designationFr: data.designationFr,
    };
  }

  /**
   * Maps array of backend zones to frontend DTOs
   * @param data - Array of backend zone objects
   * @returns Array of ZoneDTO
   */
  static mapZonesArray(data: any[]): ZoneDTO[] {
    return data.map(item => this.mapToZoneDTO(item));
  }

  // ============== LOCATION ==============

  /**
   * Maps backend Location response to frontend LocationDTO
   * @param data - Raw backend response data
   * @returns Mapped LocationDTO
   */
  static mapToLocationDTO(data: any): LocationDTO {
    return {
      id: data.id,
      code: data.code,
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation,
      localityId: data.localityId,
      locality: data.locality ? this.mapToLocalityDTO(data.locality) : undefined,
    };
  }

  /**
   * Maps frontend LocationDTO to backend request payload
   * @param data - Frontend DTO data
   * @returns Backend request payload
   */
  static mapFromLocationDTO(data: Partial<LocationDTO>): Record<string, any> {
    return {
      code: data.code,
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation,
      localityId: data.localityId,
    };
  }

  /**
   * Maps array of backend locations to frontend DTOs
   * @param data - Array of backend location objects
   * @returns Array of LocationDTO
   */
  static mapLocationsArray(data: any[]): LocationDTO[] {
    return data.map(item => this.mapToLocationDTO(item));
  }
}
