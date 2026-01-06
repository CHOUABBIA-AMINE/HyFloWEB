/**
 * Pipeline Helpers
 * Utility functions for processing pipeline coordinates and visualization
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026
 */

import { LatLngExpression, LatLngBounds } from 'leaflet';
import { PipelineDTO } from '../../core/dto';
import { LocationPoint, PipelineGeoData, PipelineStyleOptions } from '../types';

/**
 * Convert location points to Leaflet coordinate format
 */
export const convertLocationsToCoordinates = (locations: LocationPoint[]): LatLngExpression[] => {
  if (!locations || locations.length === 0) return [];
  
  // Sort by sequence if available, otherwise by id
  const sortedLocations = [...locations].sort((a, b) => {
    if (a.sequence !== undefined && b.sequence !== undefined) {
      return a.sequence - b.sequence;
    }
    return a.id - b.id;
  });
  
  return sortedLocations.map(loc => [loc.latitude, loc.longitude] as LatLngExpression);
};

/**
 * Calculate the length of a pipeline path in kilometers
 */
export const calculatePipelinePathLength = (coordinates: LatLngExpression[]): number => {
  if (coordinates.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lng1] = coordinates[i] as [number, number];
    const [lat2, lng2] = coordinates[i + 1] as [number, number];
    totalDistance += haversineDistance(lat1, lng1, lat2, lng2);
  }
  
  return totalDistance;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Get bounds for a set of coordinates
 */
export const getCoordinatesBounds = (coordinates: LatLngExpression[]): LatLngBounds | null => {
  if (coordinates.length === 0) return null;
  
  const bounds = new LatLngBounds(
    coordinates as [number, number][]
  );
  
  return bounds;
};

/**
 * Get pipeline style based on operational status
 */
export const getPipelineStyle = (pipeline: PipelineDTO): PipelineStyleOptions => {
  const baseStyle: PipelineStyleOptions = {
    weight: 3,
    opacity: 0.8,
    color: '#2196F3', // Default blue
  };
  
  // Customize based on operational status
  if (pipeline.operationalStatus) {
    const status = pipeline.operationalStatus.code?.toLowerCase();
    
    switch (status) {
      case 'operational':
      case 'active':
        baseStyle.color = '#4CAF50'; // Green
        break;
      case 'maintenance':
        baseStyle.color = '#FF9800'; // Orange
        baseStyle.dashArray = '10, 10';
        break;
      case 'inactive':
      case 'decommissioned':
        baseStyle.color = '#9E9E9E'; // Gray
        baseStyle.opacity = 0.5;
        baseStyle.dashArray = '5, 10';
        break;
      case 'under_construction':
        baseStyle.color = '#2196F3'; // Blue
        baseStyle.dashArray = '15, 5';
        break;
      default:
        baseStyle.color = '#2196F3';
    }
  }
  
  // Adjust weight based on nominal diameter
  if (pipeline.nominalDiameter) {
    if (pipeline.nominalDiameter >= 36) {
      baseStyle.weight = 6;
    } else if (pipeline.nominalDiameter >= 24) {
      baseStyle.weight = 5;
    } else if (pipeline.nominalDiameter >= 12) {
      baseStyle.weight = 4;
    } else {
      baseStyle.weight = 3;
    }
  }
  
  return baseStyle;
};

/**
 * Calculate the center point of a pipeline path
 */
export const getPipelineCenter = (coordinates: LatLngExpression[]): LatLngExpression | null => {
  if (coordinates.length === 0) return null;
  if (coordinates.length === 1) return coordinates[0];
  
  // Return the middle point
  const middleIndex = Math.floor(coordinates.length / 2);
  return coordinates[middleIndex];
};

/**
 * Format pipeline information for display
 */
export const formatPipelineInfo = (pipeline: PipelineDTO): string => {
  const parts: string[] = [];
  
  parts.push(`<strong>${pipeline.name}</strong>`);
  parts.push(`Code: ${pipeline.code}`);
  
  if (pipeline.nominalDiameter) {
    parts.push(`Diameter: ${pipeline.nominalDiameter}"`);
  }
  
  if (pipeline.length) {
    parts.push(`Length: ${pipeline.length.toFixed(2)} km`);
  }
  
  if (pipeline.operationalStatus) {
    parts.push(`Status: ${pipeline.operationalStatus.name || pipeline.operationalStatus.code}`);
  }
  
  if (pipeline.designCapacity) {
    parts.push(`Capacity: ${pipeline.designCapacity.toLocaleString()} m³/day`);
  }
  
  return parts.join('<br>');
};

/**
 * Validate pipeline coordinates
 */
export const validatePipelineCoordinates = (locations: LocationPoint[]): boolean => {
  if (!locations || locations.length < 2) return false;
  
  return locations.every(loc => {
    return (
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number' &&
      loc.latitude >= -90 &&
      loc.latitude <= 90 &&
      loc.longitude >= -180 &&
      loc.longitude <= 180
    );
  });
};

/**
 * Group pipelines by system
 */
export const groupPipelinesBySystem = (pipelines: PipelineGeoData[]): Map<string, PipelineGeoData[]> => {
  const grouped = new Map<string, PipelineGeoData[]>();
  
  pipelines.forEach(pipelineData => {
    const systemName = pipelineData.pipeline.pipelineSystem?.name || 'Uncategorized';
    
    if (!grouped.has(systemName)) {
      grouped.set(systemName, []);
    }
    
    grouped.get(systemName)!.push(pipelineData);
  });
  
  return grouped;
};
