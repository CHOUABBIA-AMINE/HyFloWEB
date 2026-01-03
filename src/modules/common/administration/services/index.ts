/**
 * Administration Services - Legacy Compatibility Layer
 * Re-exports services from new localization module for backward compatibility
 * 
 * DEPRECATED: Use imports directly from src/modules/general/localization/services
 * This file is kept for backward compatibility with existing components
 * 
 * New Import Path:
 * import { countryService, stateService, localityService } from '../../../general/localization/services';
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 * @updated 01-03-2026 (refactored for architecture alignment)
 */

// Re-export all localization services from their new proper location
export { countryService, stateService, localityService } from '../../../general/localization/services';
