/**
 * Geo Service
 * API service for fetching infrastructure geolocation data
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-06-2026
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
 */
interface LocationDTO {
  id: number;
  code: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  localityId?: number;
}

class GeoService {
  /**
   * Extract array from Spring Data Page response or return direct array
   */
  private extractData<T>(response: any): T[] {
    // Check if response has Spring Data Page structure
    if (response && typeof response === 'object' && 'content' in response && Array.isArray(response.content)) {
      console.log('GeoService - Extracting from paginated response, items:', response.content.length);
      return response.content;
    }
    
    // If it's already an array, return it
    if (Array.isArray(response)) {
      console.log('GeoService - Response is already an array, items:', response.length);
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

      console.log(`GeoService - Fetching ${locationIds.length} locations`);
      
      // Fetch all locations in parallel
      const locationPromises = locationIds.map(id => 
        axiosInstance.get(`/general/localization/location/${id}`)
          .then(response => {
            const loc = response.data;
            console.log(`GeoService - Location ${id} data:`, loc);
            return loc;
          })
          .catch(error => {
            console.error(`GeoService - Error fetching location ${id}:`, error);
            return null;
          })
      );
      
      const locations = await Promise.all(locationPromises);
      
      // Filter out failed requests and convert to LocationPoint format
      const validLocations: LocationPoint[] = locations
        .filter((loc): loc is LocationDTO => loc !== null)
        .map((loc, index) => {
          console.log(`GeoService - Converting location ${loc.id}:`, {
            original: { lat: loc.latitude, lng: loc.longitude },
            converting_to: { latitude: loc.latitude, longitude: loc.longitude }
          });
          
          return {
            id: loc.id,
            latitude: loc.latitude,
            longitude: loc.longitude,
            altitude: loc.elevation,
            sequence: index // Use array index as sequence for now
          };
        });
      
      console.log(`GeoService - Successfully fetched ${validLocations.length} locations`);
      console.log('GeoService - First valid location:', validLocations[0]);
      return validLocations;
    } catch (error) {
      console.error('GeoService - Error fetching locations:', error);
      return [];
    }
  }

  /**
   * Fetch all pipelines with their geo data
   */
  private async getPipelinesWithGeoData(): Promise<PipelineGeoData[]> {
    try {
      console.log('GeoService - Fetching pipelines from /network/core/pipeline');
      const response = await axiosInstance.get('/network/core/pipeline');
      const pipelines = this.extractData<PipelineDTO>(response.data);
      
      console.log(`GeoService - Fetched ${pipelines.length} pipelines`);
      
      if (pipelines.length === 0) {
        return [];
      }
      
      // Fetch locations for each pipeline that has locationIds
      const pipelinesWithGeo = await Promise.all(
        pipelines.map(async (pipeline) => {
          // Check if pipeline has locationIds
          if (pipeline.locationIds && pipeline.locationIds.length > 0) {
            console.log(`GeoService - Pipeline ${pipeline.code} has ${pipeline.locationIds.length} location IDs`);
            
            // Convert Set to Array if needed
            const locationIdArray = Array.isArray(pipeline.locationIds) 
              ? pipeline.locationIds 
              : Array.from(pipeline.locationIds);
            
            // Fetch the actual location data
            const locations = await this.getLocationsByIds(locationIdArray);
            
            console.log(`GeoService - Pipeline ${pipeline.code} fetched locations:`, locations);
            
            // Validate coordinates before adding
            if (locations.length >= 2 && validatePipelineCoordinates(locations)) {
              const coordinates = convertLocationsToCoordinates(locations);
              console.log(`GeoService - Pipeline ${pipeline.code} converted coordinates:`, coordinates);
              console.log(`GeoService - Pipeline ${pipeline.code} first coordinate:`, coordinates[0]);
              console.log(`GeoService - Pipeline ${pipeline.code} has ${locations.length} valid coordinates`);
              return {
                pipeline,
                locations,
                coordinates
              };
            } else {
              console.warn(`GeoService - Pipeline ${pipeline.code} has insufficient or invalid coordinates (${locations.length} locations)`);
              return null;
            }
          } else {
            // Pipeline has no location data
            console.log(`GeoService - Pipeline ${pipeline.code} has no location data`);
            return null;
          }
        })
      );
      
      // Filter out null entries (pipelines without valid geo data)
      const validPipelines = pipelinesWithGeo.filter((p): p is PipelineGeoData => p !== null);
      console.log(`GeoService - ${validPipelines.length} pipelines have valid geo data`);
      
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
      console.log('GeoService - Fetching all infrastructure data');
      console.log('GeoService - Fetching stations from /network/core/station');
      console.log('GeoService - Fetching terminals from /network/core/terminal');
      console.log('GeoService - Fetching hydrocarbon fields from /network/core/hydrocarbonField');
      console.log('GeoService - Fetching pipelines with geo data');
      
      const [stationsResponse, terminalsResponse, fieldsResponse, pipelines] = await Promise.all([
        axiosInstance.get('/network/core/station'),
        axiosInstance.get('/network/core/terminal'),
        axiosInstance.get('/network/core/hydrocarbonField'),
        this.getPipelinesWithGeoData()
      ]);

      console.log('GeoService - Stations raw response:', stationsResponse.data);
      console.log('GeoService - Terminals raw response:', terminalsResponse.data);
      console.log('GeoService - Fields raw response:', fieldsResponse.data);

      // Extract data from paginated responses
      const stations = this.extractData<StationDTO>(stationsResponse.data);
      const terminals = this.extractData<TerminalDTO>(terminalsResponse.data);
      const hydrocarbonFields = this.extractData<HydrocarbonFieldDTO>(fieldsResponse.data);

      console.log('GeoService - Extracted stations:', stations.length);
      console.log('GeoService - Extracted terminals:', terminals.length);
      console.log('GeoService - Extracted fields:', hydrocarbonFields.length);
      console.log('GeoService - Extracted pipelines with geo:', pipelines.length);

      const result = {
        stations,
        terminals,
        hydrocarbonFields,
        pipelines
      };
      
      console.log('GeoService - Returning result with totals:', {
        stations: stations.length,
        terminals: terminals.length,
        hydrocarbonFields: hydrocarbonFields.length,
        pipelines: pipelines.length
      });
      
      return result;
    } catch (error) {
      console.error('GeoService - Error fetching infrastructure data:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('GeoService - Error response:', (error as any).response);
      }
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
