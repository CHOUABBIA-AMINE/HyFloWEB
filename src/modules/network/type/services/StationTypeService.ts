/**
 * StationType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.StationTypeService
 * 
 * Provides CRUD operations and search functionality for station types.
 * Station types categorize intermediate facilities (Compression, Pumping, Metering, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { StationTypeDTO } from '../dto/StationTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/station';

export class StationTypeService {
  /**
   * Get all station types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<StationTypeDTO>> {
    const response = await axiosInstance.get<Page<StationTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get station type by ID
   */
  static async getById(id: number): Promise<StationTypeDTO> {
    const response = await axiosInstance.get<StationTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new station type
   */
  static async create(dto: StationTypeDTO): Promise<StationTypeDTO> {
    const response = await axiosInstance.post<StationTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing station type
   */
  static async update(id: number, dto: StationTypeDTO): Promise<StationTypeDTO> {
    const response = await axiosInstance.put<StationTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete station type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all station type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<StationTypeDTO>> {
    const response = await axiosInstance.get<Page<StationTypeDTO>>(`${BASE_URL}/search`, {
      params: {
        q: searchTerm,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }
}
