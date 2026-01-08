/**
 * FacilityType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.FacilityTypeService
 * 
 * Provides CRUD operations and search functionality for facility types.
 * Facility types categorize physical locations (Station, Terminal, Processing Plant, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FacilityTypeDTO } from '../dto/FacilityTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/facility-types';

export class FacilityTypeService {
  /**
   * Get all facility types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FacilityTypeDTO>> {
    const response = await axiosInstance.get<Page<FacilityTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all facility types without pagination
   */
  static async getAllNoPagination(): Promise<FacilityTypeDTO[]> {
    const response = await axiosInstance.get<FacilityTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get facility type by ID
   */
  static async getById(id: number): Promise<FacilityTypeDTO> {
    const response = await axiosInstance.get<FacilityTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new facility type
   * Validates that code and designationFr don't already exist
   */
  static async create(dto: FacilityTypeDTO): Promise<FacilityTypeDTO> {
    const response = await axiosInstance.post<FacilityTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing facility type
   * Validates that code and designationFr don't exist for other records
   */
  static async update(id: number, dto: FacilityTypeDTO): Promise<FacilityTypeDTO> {
    const response = await axiosInstance.put<FacilityTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete facility type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all facility type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FacilityTypeDTO>> {
    const response = await axiosInstance.get<Page<FacilityTypeDTO>>(`${BASE_URL}/search`, {
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
