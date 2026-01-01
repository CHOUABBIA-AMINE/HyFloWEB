/**
 * Station Type Service
 * API service for managing station types
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-24-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { StationTypeDTO } from '../dto';

class StationTypeService {
  private readonly BASE_URL = '/network/type/station';

  /**
   * Get all station types (non-paginated)
   */
  async getAll(): Promise<StationTypeDTO[]> {
    const response = await axiosInstance.get<StationTypeDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get station type by ID
   */
  async getById(id: number): Promise<StationTypeDTO> {
    const response = await axiosInstance.get<StationTypeDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}

export const stationTypeService = new StationTypeService();
