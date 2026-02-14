/**
 * Facility Service
 * Manages infrastructure facilities (stations, terminals, etc.)
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026 11:52
 * @updated 02-14-2026 11:54 - Fixed axios import path
 */

import axiosInstance from '@/shared/config/axios';
import { FacilityDTO } from '../dto/FacilityDTO';

const BASE_URL = '/network/core/facility';

export class FacilityService {
  /**
   * Get all facilities without pagination
   */
  static async getAllNoPagination(): Promise<FacilityDTO[]> {
    const response = await axiosInstance.get<FacilityDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get paginated facilities
   */
  static async getAll(page: number = 0, size: number = 20): Promise<{ content: FacilityDTO[]; totalElements: number }> {
    const response = await axiosInstance.get(`${BASE_URL}`, {
      params: { page, size }
    });
    return response.data;
  }

  /**
   * Get facility by ID
   */
  static async getById(id: number): Promise<FacilityDTO> {
    const response = await axiosInstance.get<FacilityDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new facility
   */
  static async create(data: Partial<FacilityDTO>): Promise<FacilityDTO> {
    const response = await axiosInstance.post<FacilityDTO>(BASE_URL, data);
    return response.data;
  }

  /**
   * Update existing facility
   */
  static async update(id: number, data: FacilityDTO): Promise<FacilityDTO> {
    const response = await axiosInstance.put<FacilityDTO>(`${BASE_URL}/${id}`, data);
    return response.data;
  }

  /**
   * Delete facility
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }
}

export default FacilityService;