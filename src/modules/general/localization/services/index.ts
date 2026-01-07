/**
 * General Localization Services - Barrel Export
 * 
 * All services for the General Localization module.
 * These services provide API communication for geographic entities.
 * 
 * Geographic Hierarchy:
 * Country > State > Locality > Location
 * 
 * Also includes:
 * - Zone (administrative/geographic regions)
 */

export * from './CountryService';
export * from './StateService';
export * from './LocalityService';
export * from './LocationService';
export * from './ZoneService';
