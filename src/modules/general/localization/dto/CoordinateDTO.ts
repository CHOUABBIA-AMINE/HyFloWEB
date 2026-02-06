/**
 * Coordinate DTO - General Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.dto.CoordinateDTO
 * Created: 02-06-2026 - NEW: Coordinate support for pipeline route tracing
 * 
 * Represents ordered waypoint coordinates for linear infrastructure (pipelines, segments).
 * Used to trace the precise geographic route of pipelines through space.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';

export interface CoordinateDTO {
  // Identifier (from GenericDTO)
  id?: number; // Backend: Long

  // Core coordinate fields (all required)
  sequence: number; // @NotNull, @Positive - Order of coordinate along route (required)
  latitude: number; // @NotNull, -90 to 90 degrees (WGS84) (required)
  longitude: number; // @NotNull, -180 to 180 degrees (WGS84) (required)
  
  // Optional fields
  elevation?: number; // Elevation above sea level in meters (optional)
  
  // Required relationship (ID)
  infrastructureId?: number; // @NotNull - Infrastructure asset this coordinate belongs to
  
  // Nested object (populated in responses)
  infrastructure?: InfrastructureDTO; // Optional nested infrastructure object
}

/**
 * Validates CoordinateDTO according to backend constraints
 */
export const validateCoordinateDTO = (data: Partial<CoordinateDTO>): string[] => {
  const errors: string[] = [];
  
  // Sequence validation
  if (data.sequence === undefined || data.sequence === null) {
    errors.push("Sequence is required");
  } else if (data.sequence <= 0) {
    errors.push("Sequence number must be positive");
  }
  
  // Latitude validation
  if (data.latitude === undefined || data.latitude === null) {
    errors.push("Latitude is required");
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push("Latitude must be between -90 and 90 degrees");
  }
  
  // Longitude validation
  if (data.longitude === undefined || data.longitude === null) {
    errors.push("Longitude is required");
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push("Longitude must be between -180 and 180 degrees");
  }
  
  // Infrastructure validation
  if (data.infrastructureId === undefined || data.infrastructureId === null) {
    errors.push("Infrastructure is required");
  }
  
  return errors;
};

/**
 * Creates an empty CoordinateDTO with default values
 */
export const createEmptyCoordinateDTO = (): Partial<CoordinateDTO> => ({
  sequence: 0,
  latitude: 0,
  longitude: 0,
  elevation: undefined,
  infrastructureId: undefined,
});

/**
 * Sorts coordinates by sequence number (for ordered route display)
 */
export const sortCoordinatesBySequence = (coordinates: CoordinateDTO[]): CoordinateDTO[] => {
  return [...coordinates].sort((a, b) => a.sequence - b.sequence);
};

/**
 * Validates coordinate array for pipeline route (minimum 2 points)
 */
export const validateCoordinateRoute = (coordinates: CoordinateDTO[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!coordinates || coordinates.length < 2) {
    errors.push("Pipeline route requires at least 2 coordinates");
    return { valid: false, errors };
  }
  
  // Check for duplicate sequences
  const sequences = coordinates.map(c => c.sequence);
  const uniqueSequences = new Set(sequences);
  if (sequences.length !== uniqueSequences.size) {
    errors.push("Duplicate sequence numbers found - each coordinate must have a unique sequence");
  }
  
  // Validate each coordinate
  coordinates.forEach((coord, index) => {
    const coordErrors = validateCoordinateDTO(coord);
    if (coordErrors.length > 0) {
      errors.push(`Coordinate ${index + 1}: ${coordErrors.join(', ')}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};
