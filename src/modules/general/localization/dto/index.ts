/**
 * Localization DTOs - Central Export
 * 
 * Aligned with Backend DTOs from HyFloAPI:
 * - CountryDTO: dz.sh.trc.hyflo.general.localization.dto.CountryDTO
 * - StateDTO: dz.sh.trc.hyflo.general.localization.dto.StateDTO
 * - LocalityDTO: dz.sh.trc.hyflo.general.localization.dto.LocalityDTO
 * - ZoneDTO: dz.sh.trc.hyflo.general.localization.dto.ZoneDTO
 * - LocationDTO: dz.sh.trc.hyflo.general.localization.dto.LocationDTO
 * 
 * Updated: 01-06-2026 - Field naming standardized (designation* instead of name*)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export type { CountryDTO } from './CountryDTO';
export { validateCountryDTO } from './CountryDTO';

export type { StateDTO } from './StateDTO';
export { validateStateDTO } from './StateDTO';

export type { LocalityDTO } from './LocalityDTO';
export { validateLocalityDTO } from './LocalityDTO';

export type { LocationDTO } from './LocationDTO';
export { validateLocationDTO } from './LocationDTO';

export type { ZoneDTO } from './ZoneDTO';
export { validateZoneDTO } from './ZoneDTO';
