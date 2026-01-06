/**
 * Geo Service
 * API service for fetching infrastructure geolocation data
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-06-2026 - Fixed to check pipelineSystem.product
 */

import axiosInstance from '../../../../shared/config/axios';
import { StationDTO, TerminalDTO, HydrocarbonFieldDTO, PipelineDTO } from '../../core/dto';
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
 * Backend LocationDTO structure
 * NOTE: Backend has latitude/longitude SWAPPED in the database!
 * What backend calls "latitude" is actually longitude, and vice versa.
 */
interface LocationDTO {
  id: number;
  code: string;
  latitude: number;  // Actually longitude in the backend!
  longitude: number; // Actually latitude in the backend!
  elevation?: number;
  localityId?: number;
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
   * Fetch specific locations by their IDs
   */
  private async getLocationsByIds(locationIds: number[]): Promise<LocationPoint[]> {
    try {
      if (!locationIds || locationIds.length === 0) {
        return [];
      }
      
      // Fetch all locations in parallel
      const locationPromises = locationIds.map(id => 
        axiosInstance.get(`/general/localization/location/${id}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`GeoService - Error fetching location ${id}:`, error);
            return null;
          })
      );
      
      const locations = await Promise.all(locationPromises);
      
      // Filter out failed requests and convert to LocationPoint format
      // IMPORTANT: Swap latitude/longitude because backend has them reversed!
      const validLocations: LocationPoint[] = locations
        .filter((loc): loc is LocationDTO => loc !== null)
        .map((loc, index) => ({
          id: loc.id,
          latitude: loc.longitude,  // SWAP: backend's "longitude" is actually latitude
          longitude: loc.latitude,  // SWAP: backend's "latitude" is actually longitude
          altitude: loc.elevation,
          sequence: index
        }));
      
      return validLocations;
    } catch (error) {
      console.error('GeoService - Error fetching locations:', error);
      return [];
    }
  }

  /**
   * Fetch all pipelines with their geo data and complete product information
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
        productName: samplePipeline.pipelineSystem?.product?.name,
      });
      
      // Fetch locations for each pipeline that has locationIds
      const pipelinesWithGeo = await Promise.all(
        pipelines.map(async (pipeline) => {
          // Log product data for debugging - check pipelineSystem.product
          const productCode = pipeline.pipelineSystem?.product?.code;
          if (productCode) {
            console.log(`Pipeline ${pipeline.code} - Product: ${productCode}`);
          } else {
            console.warn(`Pipeline ${pipeline.code} - NO PRODUCT DATA (pipelineSystem: ${!!pipeline.pipelineSystem})`);
          }

          // Check if pipeline has locationIds
          if (pipeline.locationIds && pipeline.locationIds.length > 0) {
            // Convert Set to Array if needed
            const locationIdArray = Array.isArray(pipeline.locationIds) 
              ? pipeline.locationIds 
              : Array.from(pipeline.locationIds);
            
            // Fetch the actual location data (with coordinate correction)
            const locations = await this.getLocationsByIds(locationIdArray);
            
            // Validate coordinates before adding
            if (locations.length >= 2 && validatePipelineCoordinates(locations)) {
              const coordinates = convertLocationsToCoordinates(locations);
              return {
                pipeline,
                locations,
                coordinates
              };
            } else {
              console.warn(`Pipeline ${pipeline.code} - Invalid or insufficient coordinates`);
            }
          } else {
            console.warn(`Pipeline ${pipeline.code} - No location IDs`);
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
      
      const [stations, terminals, hydrocarbonFields, pipelines] = await Promise.all([
        this.fetchAllPages<StationDTO>('/network/core/station'),
        this.fetchAllPages<TerminalDTO>('/network/core/terminal'),
        this.fetchAllPages<HydrocarbonFieldDTO>('/network/core/hydrocarbonField'),
        this.getPipelinesWithGeoData()
      ]);

      console.log('GeoService - Infrastructure loaded:', {
        stations: stations.length,
        terminals: terminals.length,
        hydrocarbonFields: hydrocarbonFields.length,
        pipelines: pipelines.length
      });

      return {
        stations,
        terminals,
        hydrocarbonFields,
        pipelines
      };
    } catch (error) {
      console.error('GeoService - Error fetching infrastructure data:', error);
      // Return empty arrays on error to prevent crashes
      return {
        stations: [],
        terminals: [],
        hydrocarbonFields: [],
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
    
    return {
      stations: data.stations.filter(s => 
        s.latitude >= bounds.south && s.latitude <= bounds.north &&
        s.longitude >= bounds.west && s.longitude <= bounds.east
      ),
      terminals: data.terminals.filter(t => 
        t.latitude >= bounds.south && t.latitude <= bounds.north &&
        t.longitude >= bounds.west && t.longitude <= bounds.east
      ),
      hydrocarbonFields: data.hydrocarbonFields.filter(f => 
        f.latitude >= bounds.south && f.latitude <= bounds.north &&
        f.longitude >= bounds.west && f.longitude <= bounds.east
      ),
      pipelines: pipelinesInBounds
    };
  }
}

export default new GeoService();
