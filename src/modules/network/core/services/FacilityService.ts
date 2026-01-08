/**
 * Facility Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.FacilityService
 * 
 * Provides CRUD operations and search functionality for facilities.
 * Facilities represent physical locations where equipment is installed.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FacilityDTO } from '../dto/FacilityDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/facilities';

export class FacilityService {
  /**
   * Get all facilities with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FacilityDTO>> {
    const response = await axiosInstance.get<Page<FacilityDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all facilities without pagination
   */
  static async getAllNoPagination(): Promise<FacilityDTO[]> {
    const response = await axiosInstance.get<FacilityDTO[]>(`${BASE_URL}/all`);
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
   * Validates that code doesn't already exist
   */
  static async create(dto: FacilityDTO): Promise<FacilityDTO> {
    const response = await axiosInstance.post<FacilityDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing facility
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: FacilityDTO): Promise<FacilityDTO> {
    const response = await axiosInstance.put<FacilityDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete facility by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all facility fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FacilityDTO>> {
    const response = await axiosInstance.get<Page<FacilityDTO>>(`${BASE_URL}/search`, {
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
   * Find facilities by infrastructure
   */
  static async findByInfrastructure(infrastructureId: number): Promise<FacilityDTO[]> {
    const response = await axiosInstance.get<FacilityDTO[]>(
      `${BASE_URL}/by-infrastructure/${infrastructureId}`
    );
    return response.data;
  }
}
