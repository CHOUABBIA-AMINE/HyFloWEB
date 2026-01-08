/**
 * Map Helpers
 * Utility functions for map operations and coordinate transformations
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-08-2026 - Fixed type errors
 */

import { LatLngExpression, LatLngTuple } from 'leaflet';
import { StationDTO, TerminalDTO, HydrocarbonFieldDTO } from '../../core/dto';

/**
 * Convert DTO to LatLngExpression
 */
export const toLatLng = (item: StationDTO | TerminalDTO | HydrocarbonFieldDTO): LatLngExpression => {
  // Handle optional properties with defaults
  const lat = (item as any).latitude ?? 0;
  const lng = (item as any).longitude ?? 0;
  return [lat, lng] as LatLngTuple;
};

/**
 * Calculate center point of multiple coordinates
 */
export const calculateCenter = (coordinates: LatLngExpression[]): LatLngTuple => {
  if (coordinates.length === 0) return [36.7538, 3.0588]; // Default: Algiers

  const sum = coordinates.reduce(
    (acc, coord) => {
      let lat: number, lng: number;
      
      if (Array.isArray(coord)) {
        [lat, lng] = coord;
      } else {
        lat = (coord as any).lat;
        lng = (coord as any).lng;
      }
      
      return { lat: acc.lat + lat, lng: acc.lng + lng };
    },
    { lat: 0, lng: 0 }
  );

  return [sum.lat / coordinates.length, sum.lng / coordinates.length];
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
};

/**
 * Calculate distance between two points (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
