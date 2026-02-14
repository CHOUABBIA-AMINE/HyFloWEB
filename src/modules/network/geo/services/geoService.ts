/**
 * Geo Service
 * API service for fetching infrastructure geolocation data
 * 
 * Updated: 02-14-2026 02:09 - Fixed: Use only segment coordinates (no infrastructure in segments)
 * Updated: 02-14-2026 02:06 - Build segment paths with infrastructure endpoints
 * Updated: 02-14-2026 01:31 - Fixed: Coordinates now belong to PipelineSegment, not Pipeline
 * Updated: 02-06-2026 - Backend replaced locationIds with coordinateIds
 * Updated: 01-16-2026 - Replaced HydrocarbonFieldDTO with ProductionFieldDTO
 * 
 * Architecture: Pipeline -> PipelineSegment[] -> Coordinates[] (ordered by sequence)
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 02-14-2026
 */

import axiosInstance from '../../../../shared/config/axios';
import { StationDTO, TerminalDTO, ProductionFieldDTO, PipelineDTO, PipelineSegmentDTO } from '../../core/dto';
import { InfrastructureData, PipelineGeoData, LocationPoint } from '../types/geo.types';
import { convertLocationsToCoordinates, validatePipelineCoordinates } from '../utils/pipelineHelpers';

/**
 * Spring Data Page response structure
 */
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Backend CoordinateDTO structure
 * Coordinates define the geographic path of pipeline segments
 */
interface CoordinateDTO {
  id: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  sequence?: number;
}

class GeoService {
  /**
   * Fetch all pages from a paginated endpoint
   */
  private async fetchAllPages<T>(url: string, pageSize: number = 100): Promise<T[]> {
    try {
      const allData: T[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await axiosInstance.get(url, {
          params: {
            page,
            size: pageSize
          }
        });

        const pageData = response.data;

        // Check if it's a Spring Data Page response
        if (pageData && typeof pageData === 'object' && 'content' in pageData) {
          allData.push(...pageData.content);
          hasMore = !pageData.last && pageData.content.length > 0;
          page++;
          
          console.log(`GeoService - Fetched page ${page}/${pageData.totalPages} (${pageData.content.length} items)`);
        } else if (Array.isArray(pageData)) {
          // If it's a direct array, just return it
          allData.push(...pageData);
          hasMore = false;
        } else {
          // Unexpected format
          hasMore = false;
        }
      }

      console.log(`GeoService - Total items fetched from ${url}: ${allData.length}`);
      return allData;
    } catch (error) {
      console.error(`GeoService - Error fetching all pages from ${url}:`, error);
      return [];
    }
  }

  /**
   * Extract array from Spring Data Page response or return direct array
   */
  private extractData<T>(response: any): T[] {
    // Check if response has Spring Data Page structure
    if (response && typeof response === 'object' && 'content' in response && Array.isArray(response.content)) {
      return response.content;
    }
    
    // If it's already an array, return it
    if (Array.isArray(response)) {
      return response;
    }
    
    // Fallback to empty array
    console.warn('GeoService - Unexpected response format, returning empty array');
    return [];
  }

  /**
   * Fetch specific coordinates by their IDs
   * Backend now uses Coordinate entity instead of Location
   */
  private async getCoordinatesByIds(coordinateIds: number[]): Promise<LocationPoint[]> {
    try {
      if (!coordinateIds || coordinateIds.length === 0) {
        return [];
      }
      
      // Fetch all coordinates in parallel
      const coordinatePromises = coordinateIds.map(id => 
        axiosInstance.get(`/general/localization/coordinate/${id}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`GeoService - Error fetching coordinate ${id}:`, error);
            return null;
          })
      );
      
      const coordinates = await Promise.all(coordinatePromises);
      
      // Filter out failed requests and convert to LocationPoint format
      const validCoordinates: LocationPoint[] = coordinates
        .filter((coord): coord is CoordinateDTO => coord !== null)
        .map((coord, index) => ({
          id: coord.id,
          latitude: coord.latitude,
          longitude: coord.longitude,
          altitude: coord.altitude,
          sequence: coord.sequence ?? index
        }));
      
      // Sort by sequence if available
      validCoordinates.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      
      return validCoordinates;
    } catch (error) {
      console.error('GeoService - Error fetching coordinates:', error);
      return [];
    }
  }

  /**
   * Build segment path from its coordinates
   * Note: PipelineSegmentDTO only has coordinateIds, no infrastructure references
   */
  private async buildSegmentPath(segment: PipelineSegmentDTO): Promise<LocationPoint[]> {
    const path: LocationPoint[] = [];
    
    // Get segment's coordinates (ordered by sequence)
    if (segment.coordinateIds && segment.coordinateIds.length > 0) {
      const coordinateIdArray: number[] = Array.isArray(segment.coordinateIds)
        ? segment.coordinateIds as number[]
        : Array.from(segment.coordinateIds) as number[];
      
      const coords = await this.getCoordinatesByIds(coordinateIdArray);
      path.push(...coords);
    } else {
      console.warn(`Segment ${segment.code} - No coordinates defined`);
    }
    
    return path;
  }

  /**
   * Fetch pipeline segments for a specific pipeline
   * NEW: Coordinates are now stored in segments, not pipelines
   */
  private async getPipelineSegments(pipelineId: number): Promise<PipelineSegmentDTO[]> {
    try {
      // Use the correct endpoint: /pipeline/{pipelineId}
      const response = await axiosInstance.get(`/network/core/pipelineSegment/pipeline/${pipelineId}`);
      
      const segments = Array.isArray(response.data) ? response.data : this.extractData<PipelineSegmentDTO>(response.data);
      
      // Sort segments by startPoint to maintain pipeline path order
      segments.sort((a, b) => (a.startPoint ?? 0) - (b.startPoint ?? 0));
      
      console.log(`GeoService - Pipeline ${pipelineId}: Found ${segments.length} segments`);
      
      return segments;
    } catch (error) {
      console.error(`GeoService - Error fetching segments for pipeline ${pipelineId}:`, error);
      return [];
    }
  }

  /**
   * Fetch all pipelines with their geo data from segments
   * Build paths by concatenating ordered segment coordinates
   */
  private async getPipelinesWithGeoData(): Promise<PipelineGeoData[]> {
    try {
      // Fetch ALL pipelines across all pages
      const pipelines = await this.fetchAllPages<PipelineDTO>('/network/core/pipeline', 100);
      
      console.log(`GeoService - Processing ${pipelines.length} pipelines`);
      
      if (pipelines.length === 0) {
        return [];
      }
      
      // Log product data structure for debugging
      const samplePipeline = pipelines[0];
      console.log('GeoService - Sample pipeline structure:', {
        code: samplePipeline.code,
        hasPipelineSystem: !!samplePipeline.pipelineSystem,
        pipelineSystemName: samplePipeline.pipelineSystem?.name,
        hasProduct: !!samplePipeline.pipelineSystem?.product,
        productCode: samplePipeline.pipelineSystem?.product?.code,
      });
      
      // Fetch segments and build paths for each pipeline
      const pipelinesWithGeo = await Promise.all(
        pipelines.map(async (pipeline) => {
          // Log product data for debugging
          const productCode = pipeline.pipelineSystem?.product?.code;
          if (productCode) {
            console.log(`Pipeline ${pipeline.code} - Product: ${productCode}`);
          } else {
            console.warn(`Pipeline ${pipeline.code} - NO PRODUCT DATA (pipelineSystem: ${!!pipeline.pipelineSystem})`);
          }

          // Fetch segments for this pipeline
          if (!pipeline.id) {
            console.warn(`Pipeline ${pipeline.code} - No ID, skipping`);
            return null;
          }
          
          const segments = await this.getPipelineSegments(pipeline.id);
          
          if (segments.length === 0) {
            console.warn(`Pipeline ${pipeline.code} - No segments found`);
            return null;
          }
          
          // Build complete path by concatenating all segment paths
          const allLocations: LocationPoint[] = [];
          
          for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            console.log(`Pipeline ${pipeline.code} - Processing segment ${i + 1}/${segments.length}: ${segment.code}`);
            
            const segmentPath = await this.buildSegmentPath(segment);
            
            if (segmentPath.length === 0) {
              console.warn(`Pipeline ${pipeline.code} - Segment ${segment.code} has no coordinates`);
              continue;
            }
            
            // Add segment path to overall pipeline path
            // Skip first point if it matches the last point of previous segment (avoid duplicates)
            if (allLocations.length > 0 && segmentPath.length > 0) {
              const lastLoc = allLocations[allLocations.length - 1];
              const firstLoc = segmentPath[0];
              
              // Check if coordinates match (with small tolerance for floating point)
              const tolerance = 0.000001;
              if (Math.abs(lastLoc.latitude - firstLoc.latitude) < tolerance && 
                  Math.abs(lastLoc.longitude - firstLoc.longitude) < tolerance) {
                // Skip duplicate connection point
                console.log(`Pipeline ${pipeline.code} - Removing duplicate connection point between segments`);
                allLocations.push(...segmentPath.slice(1));
              } else {
                allLocations.push(...segmentPath);
              }
            } else {
              allLocations.push(...segmentPath);
            }
          }
          
          if (allLocations.length < 2) {
            console.warn(`Pipeline ${pipeline.code} - Insufficient path points (need at least 2, got ${allLocations.length})`);
            return null;
          }
          
          console.log(`Pipeline ${pipeline.code} - Complete path: ${allLocations.length} points from ${segments.length} segments`);
          
          // Validate coordinates before adding
          if (validatePipelineCoordinates(allLocations)) {
            const coordinates = convertLocationsToCoordinates(allLocations);
            return {
              pipeline,
              locations: allLocations,
              coordinates
            };
          } else {
            console.warn(`Pipeline ${pipeline.code} - Invalid coordinates`);
          }
          
          return null;
        })
      );
      
      // Filter out null entries (pipelines without valid geo data)
      const validPipelines = pipelinesWithGeo.filter((p): p is PipelineGeoData => p !== null);
      
      console.log(`GeoService - ${validPipelines.length} pipelines with valid geo data`);
      
      // Summary of products found
      const productCounts = new Map<string, number>();
      validPipelines.forEach(p => {
        const productCode = p.pipeline.pipelineSystem?.product?.code || 'NO_PRODUCT';
        productCounts.set(productCode, (productCounts.get(productCode) || 0) + 1);
      });
      console.log('GeoService - Product distribution:', Object.fromEntries(productCounts));
      
      return validPipelines;
    } catch (error) {
      console.error('GeoService - Error fetching pipelines:', error);
      return [];
    }
  }

  /**
   * Get all infrastructure with geo data
   */
  async getAllInfrastructure(): Promise<InfrastructureData> {
    try {
      console.log('GeoService - Fetching all infrastructure data...');
      
      const [stations, terminals, productionFields, pipelines] = await Promise.all([
        this.fetchAllPages<StationDTO>('/network/core/station'),
        this.fetchAllPages<TerminalDTO>('/network/core/terminal'),
        this.fetchAllPages<ProductionFieldDTO>('/network/core/productionField'),
        this.getPipelinesWithGeoData()
      ]);

      console.log('GeoService - Infrastructure loaded:', {
        stations: stations.length,
        terminals: terminals.length,
        productionFields: productionFields.length,
        pipelines: pipelines.length
      });

      return {
        stations,
        terminals,
        productionFields,
        pipelines
      };
    } catch (error) {
      console.error('GeoService - Error fetching infrastructure data:', error);
      // Return empty arrays on error to prevent crashes
      return {
        stations: [],
        terminals: [],
        productionFields: [],
        pipelines: []
      };
    }
  }

  /**
   * Get infrastructure within bounding box (for performance optimization)
   * TODO: Implement backend endpoint for spatial queries
   */
  async getInfrastructureInBounds(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<InfrastructureData> {
    // For now, fetch all and filter client-side
    const data = await this.getAllInfrastructure();
    
    // Filter pipelines based on bounds (check if any coordinate is within bounds)
    const pipelinesInBounds = (data.pipelines || []).filter(pipelineData => {
      return pipelineData.locations.some(loc => 
        loc.latitude >= bounds.south && loc.latitude <= bounds.north &&
        loc.longitude >= bounds.west && loc.longitude <= bounds.east
      );
    });
    
    // Helper function to safely check coordinates via location object
    const hasValidCoordinates = (item: any): boolean => {
      if (item.location) {
        return typeof item.location.latitude === 'number' && typeof item.location.longitude === 'number';
      }
      return false;
    };
    
    // Helper to get coordinates from location object
    const getCoords = (item: any) => {
      if (item.location) {
        return { lat: item.location.latitude, lng: item.location.longitude };
      }
      return { lat: 0, lng: 0 };
    };
    
    return {
      stations: data.stations.filter(s => {
        if (!hasValidCoordinates(s)) return false;
        const coords = getCoords(s);
        return coords.lat >= bounds.south && coords.lat <= bounds.north &&
               coords.lng >= bounds.west && coords.lng <= bounds.east;
      }),
      terminals: data.terminals.filter(t => {
        if (!hasValidCoordinates(t)) return false;
        const coords = getCoords(t);
        return coords.lat >= bounds.south && coords.lat <= bounds.north &&
               coords.lng >= bounds.west && coords.lng <= bounds.east;
      }),
      productionFields: data.productionFields.filter(f => {
        if (!hasValidCoordinates(f)) return false;
        const coords = getCoords(f);
        return coords.lat >= bounds.south && coords.lat <= bounds.north &&
               coords.lng >= bounds.west && coords.lng <= bounds.east;
      }),
      pipelines: pipelinesInBounds
    };
  }
}

export default new GeoService();
