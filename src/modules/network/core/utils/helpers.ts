/**
 * Helper Utilities - Network Core Module
 * 
 * Helper functions specific to Network Core entities.
 * Extends common helpers with domain-specific utilities.
 * 
 * @author CHOUABBIA Amine
 */

import {
  groupBy,
  sortBy,
  filterBySearch,
} from '../../common/utils/helpers';
import type { Page } from '@/types/pagination';

/**
 * Calculate total pipeline length
 */
export const calculateTotalLength = (
  segments: Array<{ length?: number | null }>
): number => {
  return segments.reduce((total, segment) => {
    return total + (segment.length || 0);
  }, 0);
};

/**
 * Calculate average diameter
 */
export const calculateAverageDiameter = (
  segments: Array<{ diameter?: number | null }>
): number => {
  const validSegments = segments.filter(s => s.diameter !== null && s.diameter !== undefined);
  if (validSegments.length === 0) return 0;
  
  const sum = validSegments.reduce((total, segment) => {
    return total + (segment.diameter || 0);
  }, 0);
  
  return sum / validSegments.length;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Group pipelines by system
 */
export const groupPipelinesBySystem = <T extends { pipelineSystemId?: number }>(
  pipelines: T[]
): Record<string, T[]> => {
  return groupBy(pipelines, 'pipelineSystemId' as keyof T);
};

/**
 * Group equipment by facility
 */
export const groupEquipmentByFacility = <T extends { facilityId?: number }>(
  equipment: T[]
): Record<string, T[]> => {
  return groupBy(equipment, 'facilityId' as keyof T);
};

/**
 * Filter by operational status
 */
export const filterByOperationalStatus = <T extends { operationalStatusId?: number }>(
  items: T[],
  statusId: number
): T[] => {
  return items.filter(item => item.operationalStatusId === statusId);
};

/**
 * Filter by product
 */
export const filterByProduct = <T extends { productId?: number }>(
  items: T[],
  productId: number
): T[] => {
  return items.filter(item => item.productId === productId);
};

/**
 * Sort by length (descending)
 */
export const sortByLengthDesc = <T extends { length?: number | null }>(
  items: T[]
): T[] => {
  return [...items].sort((a, b) => {
    const lengthA = a.length || 0;
    const lengthB = b.length || 0;
    return lengthB - lengthA;
  });
};

/**
 * Sort by diameter (descending)
 */
export const sortByDiameterDesc = <T extends { diameter?: number | null }>(
  items: T[]
): T[] => {
  return [...items].sort((a, b) => {
    const diameterA = a.diameter || 0;
    const diameterB = b.diameter || 0;
    return diameterB - diameterA;
  });
};

/**
 * Get active items only
 */
export const getActiveItems = <T extends { isActive?: boolean }>(
  items: T[]
): T[] => {
  return items.filter(item => item.isActive !== false);
};

/**
 * Calculate total capacity
 */
export const calculateTotalCapacity = (
  items: Array<{ capacity?: number | null }>
): number => {
  return items.reduce((total, item) => {
    return total + (item.capacity || 0);
  }, 0);
};

/**
 * Find nearest facility to coordinates
 */
export const findNearestFacility = <T extends { latitude?: number; longitude?: number }>(
  facilities: T[],
  targetLat: number,
  targetLon: number
): T | null => {
  if (facilities.length === 0) return null;
  
  let nearest = facilities[0];
  let minDistance = Infinity;
  
  for (const facility of facilities) {
    if (facility.latitude && facility.longitude) {
      const distance = calculateDistance(
        targetLat,
        targetLon,
        facility.latitude,
        facility.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = facility;
      }
    }
  }
  
  return nearest;
};

/**
 * Convert pressure units (bar to psi)
 */
export const barToPsi = (bar: number): number => {
  return bar * 14.5038;
};

/**
 * Convert pressure units (psi to bar)
 */
export const psiToBar = (psi: number): number => {
  return psi / 14.5038;
};

/**
 * Convert temperature (Celsius to Fahrenheit)
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9) / 5 + 32;
};

/**
 * Convert temperature (Fahrenheit to Celsius)
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return ((fahrenheit - 32) * 5) / 9;
};

// Re-export common helpers
export { groupBy, sortBy, filterBySearch };
