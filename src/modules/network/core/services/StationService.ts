/**
 * Station Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.StationService
 * Updated: 01-15-2026 - Added pipelineSystem query support
 * 
 * Provides CRUD operations and search functionality for stations.
 * Stations are intermediate facilities along pipelines (compression, pumping, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import axiosInstance from '@/shared/config/axios';
import type { StationDTO } from '../dto/StationDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/station';

export class StationService {
  /**
   * Get all stations with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<StationDTO>> {
    const response = await axiosInstance.get<Page<StationDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all stations without pagination
   */
  static async getAllNoPagination(): Promise<StationDTO[]> {
    const response = await axiosInstance.get<StationDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get station by ID
   */
  static async getById(id: number): Promise<StationDTO> {
    const response = await axiosInstance.get<StationDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new station
   * Validates that code doesn't already exist
   */
  static async create(dto: StationDTO): Promise<StationDTO> {
    const response = await axiosInstance.post<StationDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing station
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: StationDTO): Promise<StationDTO> {
    const response = await axiosInstance.put<StationDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete station by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all station fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<StationDTO>> {
    const response = await axiosInstance.get<Page<StationDTO>>(`${BASE_URL}/search`, {
      params: {
        q: searchTerm,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Find stations by pipeline system
   * Returns all stations associated with a specific pipeline system
   */
  static async findByPipelineSystem(systemId: number): Promise<StationDTO[]> {
    const response = await axiosInstance.get<StationDTO[]>(
      `${BASE_URL}/by-pipeline-system/${systemId}`
    );
    return response.data;
  }

  /**
   * Find stations by location
   * Returns all stations at a specific location
   */
  static async findByLocation(locationId: number): Promise<StationDTO[]> {
    const response = await axiosInstance.get<StationDTO[]>(
      `${BASE_URL}/by-location/${locationId}`
    );
    return response.data;
  }
}
