/**
 * Map Helper Utilities
 * Helper functions for map operations and calculations
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-08-2026 - Fixed optional location handling
 */

import { LatLngExpression, LatLngTuple } from 'leaflet';

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Convert an object with latitude/longitude to LatLngTuple
 * Supports both direct properties and nested location object (optional)
 */
export const toLatLng = (
  obj: { latitude: number; longitude: number } | { location?: { latitude?: number; longitude?: number } }
): LatLngTuple => {
  // Check if it has location property
  if ('location' in obj && obj.location && obj.location.latitude !== undefined && obj.location.longitude !== undefined) {
    return [obj.location.latitude, obj.location.longitude];
  }
  
  // Direct latitude/longitude properties
  if ('latitude' in obj && 'longitude' in obj && obj.latitude !== undefined && obj.longitude !== undefined) {
    return [obj.latitude, obj.longitude];
  }
  
  // Fallback
  return [0, 0];
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate [lat, lng]
 * @param coord2 Second coordinate [lat, lng]
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  coord1: LatLngTuple,
  coord2: LatLngTuple
): number => {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1 = toRadians(coord1[0]);
  const lat2 = toRadians(coord2[0]);
  const dLat = toRadians(coord2[0] - coord1[0]);
  const dLng = toRadians(coord2[1] - coord1[1]);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Calculate center point of multiple coordinates
 */
export const calculateCenter = (coordinates: LatLngExpression[]): LatLngTuple => {
  if (coordinates.length === 0) {
    return [0, 0];
  }
  
  // Convert all coordinates to tuples for consistent handling
  const tuples = coordinates.map(coord => {
    if (Array.isArray(coord)) {
      return coord as LatLngTuple;
    }
    // Handle object format {lat, lng}
    if (typeof coord === 'object' && 'lat' in coord && 'lng' in coord) {
      return [coord.lat, coord.lng] as LatLngTuple;
    }
    return [0, 0] as LatLngTuple;
  });
  
  const sum = tuples.reduce(
    (acc, [lat, lng]) => {
      return { lat: acc.lat + lat, lng: acc.lng + lng };
    },
    { lat: 0, lng: 0 }
  );
  
  return [sum.lat / coordinates.length, sum.lng / coordinates.length];
};

/**
 * Calculate total length of a polyline
 */
export const calculatePolylineLength = (coordinates: LatLngTuple[]): number => {
  if (coordinates.length < 2) {
    return 0;
  }
  
  let totalDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  
  return totalDistance;
};

/**
 * Get bounding box for a set of coordinates
 */
export const getBoundingBox = (
  coordinates: LatLngTuple[]
): { north: number; south: number; east: number; west: number } => {
  if (coordinates.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }
  
  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;
  
  coordinates.forEach(([lat, lng]) => {
    if (lat > north) north = lat;
    if (lat < south) south = lat;
    if (lng > east) east = lng;
    if (lng < west) west = lng;
  });
  
  return { north, south, east, west };
};

/**
 * Check if a coordinate is within a bounding box
 */
export const isCoordinateInBounds = (
  coordinate: LatLngTuple,
  bounds: { north: number; south: number; east: number; west: number }
): boolean => {
  const [lat, lng] = coordinate;
  
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
};

/**
 * Simplify a polyline using Douglas-Peucker algorithm
 */
export const simplifyPolyline = (
  coordinates: LatLngTuple[],
  tolerance: number = 0.001
): LatLngTuple[] => {
  if (coordinates.length <= 2) {
    return coordinates;
  }
  
  // Helper function to calculate perpendicular distance
  const perpendicularDistance = (
    point: LatLngTuple,
    lineStart: LatLngTuple,
    lineEnd: LatLngTuple
  ): number => {
    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    if (dx === 0 && dy === 0) {
      return calculateDistance(point, lineStart);
    }
    
    const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    
    if (t < 0) {
      return calculateDistance(point, lineStart);
    } else if (t > 1) {
      return calculateDistance(point, lineEnd);
    }
    
    const nearestPoint: LatLngTuple = [x1 + t * dx, y1 + t * dy];
    return calculateDistance(point, nearestPoint);
  };
  
  // Recursive Douglas-Peucker
  const douglasPeucker = (points: LatLngTuple[]): LatLngTuple[] => {
    if (points.length <= 2) {
      return points;
    }
    
    let maxDistance = 0;
    let maxIndex = 0;
    const start = points[0];
    const end = points[points.length - 1];
    
    for (let i = 1; i < points.length - 1; i++) {
      const distance = perpendicularDistance(points[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }
    
    if (maxDistance > tolerance) {
      const left = douglasPeucker(points.slice(0, maxIndex + 1));
      const right = douglasPeucker(points.slice(maxIndex));
      return [...left.slice(0, -1), ...right];
    }
    
    return [start, end];
  };
  
  return douglasPeucker(coordinates);
};
