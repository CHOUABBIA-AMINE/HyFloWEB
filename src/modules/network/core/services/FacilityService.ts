/**
 * Facility Service
 * Manages infrastructure facilities (stations, terminals, etc.)
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026 11:52
 */

import api from '@/config/axios';
import { FacilityDTO } from '../dto/FacilityDTO';

const API_URL = '/api/facilities';

export const FacilityService = {
  /**
   * Get all facilities without pagination
   */
  async getAllNoPagination(): Promise<FacilityDTO[]> {
    const response = await api.get<FacilityDTO[]>(`${API_URL}/all`);
    return response.data;
  },

  /**
   * Get paginated facilities
   */
  async getAll(page: number = 0, size: number = 20): Promise<{ content: FacilityDTO[]; totalElements: number }> {
    const response = await api.get(`${API_URL}`, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Get facility by ID
   */
  async getById(id: number): Promise<FacilityDTO> {
    const response = await api.get<FacilityDTO>(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new facility
   */
  async create(data: Partial<FacilityDTO>): Promise<FacilityDTO> {
    const response = await api.post<FacilityDTO>(API_URL, data);
    return response.data;
  },

  /**
   * Update existing facility
   */
  async update(id: number, data: FacilityDTO): Promise<FacilityDTO> {
    const response = await api.put<FacilityDTO>(`${API_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete facility
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${API_URL}/${id}`);
  },
};

export default FacilityService;