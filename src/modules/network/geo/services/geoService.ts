/**
 * Geo Service
 * API service for fetching infrastructure geolocation data
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-24-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { StationDTO, TerminalDTO, HydrocarbonFieldDTO } from '../../core/dto';
import { InfrastructureData } from '../types/geo.types';

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
   * Get all infrastructure with geo data
   */
  async getAllInfrastructure(): Promise<InfrastructureData> {
    try {
      console.log('GeoService - Fetching stations from /network/core/station');
      console.log('GeoService - Fetching terminals from /network/core/terminal');
      console.log('GeoService - Fetching hydrocarbon fields from /network/core/hydrocarbonField');
      
      const [stationsResponse, terminalsResponse, fieldsResponse] = await Promise.all([
        axiosInstance.get('/network/core/station'),
        axiosInstance.get('/network/core/terminal'),
        axiosInstance.get('/network/core/hydrocarbonField')
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

      const result = {
        stations,
        terminals,
        hydrocarbonFields
      };
      
      console.log('GeoService - Returning result with totals:', {
        stations: stations.length,
        terminals: terminals.length,
        hydrocarbonFields: hydrocarbonFields.length
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
        hydrocarbonFields: []
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
      )
    };
  }
}

export default new GeoService();
