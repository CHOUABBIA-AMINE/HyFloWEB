/**
 * Organization Services
 * Exports all services related to organization entities
 * 
 * Aligned with backend: dz.sh.trc.hyflo.general.organization.service
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

// Re-export localization services that organization depends on
export { countryService, stateService, localityService } from '../../localization/services';
export { countryService as localCountryService, stateService as localStateService, localityService as localLocalityService } from '../../localization/services';
