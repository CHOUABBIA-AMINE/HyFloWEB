/**
 * Localization DTOs - Central Export
 * 
 * Aligned with Backend DTOs from HyFloAPI:
 * - CountryDTO: dz.sh.trc.hyflo.general.localization.dto.CountryDTO
 * - StateDTO: dz.sh.trc.hyflo.general.localization.dto.StateDTO
 * - LocalityDTO: dz.sh.trc.hyflo.general.localization.dto.LocalityDTO
 * - DistrictDTO: dz.sh.trc.hyflo.general.localization.dto.DistrictDTO
 * - ZoneDTO: dz.sh.trc.hyflo.general.localization.dto.ZoneDTO
 * - LocationDTO: dz.sh.trc.hyflo.general.localization.dto.LocationDTO
 * - CoordinateDTO: dz.sh.trc.hyflo.general.localization.dto.CoordinateDTO (NEW)
 * 
 * Updated: 02-06-2026 - Added CoordinateDTO for pipeline route tracing
 * Updated: 01-15-2026 - Added DistrictDTO
 * 
 * Geographic Hierarchy (No relationship between Country and State):
 * Country (Independent)
 * State (Independent) → Locality → District → Location
 * 
 * Coordinate: Ordered waypoint for linear infrastructure (pipelines)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export type { CountryDTO } from './CountryDTO';
export { validateCountryDTO } from './CountryDTO';

export type { StateDTO } from './StateDTO';
export { validateStateDTO } from './StateDTO';

export type { LocalityDTO } from './LocalityDTO';
export { validateLocalityDTO } from './LocalityDTO';

export type { DistrictDTO } from './DistrictDTO';
export { validateDistrictDTO } from './DistrictDTO';

export type { LocationDTO } from './LocationDTO';
export { validateLocationDTO } from './LocationDTO';

export type { ZoneDTO } from './ZoneDTO';
export { validateZoneDTO } from './ZoneDTO';

export type { CoordinateDTO } from './CoordinateDTO';
export { validateCoordinateDTO, createEmptyCoordinateDTO, sortCoordinatesBySequence, validateCoordinateRoute } from './CoordinateDTO';
