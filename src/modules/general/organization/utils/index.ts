/**
 * General Organization Utils - Barrel Export
 * 
 * This module now re-exports from the centralized utilities location.
 * Module-specific utilities (constants, mapper, localizationUtils) remain local.
 * 
 * Migration Date: 2026-01-08
 * Status: Using centralized utilities from @/shared/utils
 */

// Re-export centralized utilities (validators, formatters, helpers)
export * from '@/shared/utils';

// Keep module-specific utilities
export * from './constants';
export * from './organizationMapper';
export * from './localizationUtils';

// Note: validation.ts, formatters.ts, and helpers.ts are now deprecated
// They will be removed in Phase 3 after verification
