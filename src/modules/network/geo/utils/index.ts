/**
 * Network Geo Utils - Barrel Export
 * 
 * Migration Date: 2026-01-08
 * Updated: 2026-01-08 - Fixed import names and added explicit exports
 * Status: Using centralized utilities from @/shared/utils
 */

// Re-export centralized utilities with correct names
export {
  formatDistance,
  formatArea,
  formatVolume,
  isValidCoordinates as validateCoordinate,
  isValidLatitude as validateLatitude,
  isValidLongitude as validateLongitude,
} from '@/shared/utils';

// Keep module-specific utilities
export * from './iconFactory';
export * from './mapHelpers';
export * from './pipelineHelpers';

// Explicitly export commonly used functions to avoid confusion
export { getPipelineStyle } from './pipelineHelpers';
