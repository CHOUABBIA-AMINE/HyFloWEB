/**
 * HydrocarbonField Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.HydrocarbonFieldService
 * 
 * Provides CRUD operations and search functionality for hydrocarbon fields.
 * Hydrocarbon fields are geological formations where oil/gas is extracted.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { HydrocarbonFieldDTO } from '../dto/HydrocarbonFieldDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/hydrocarbon-field';

export class HydrocarbonFieldService {
  /**
   * Get all hydrocarbon fields with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<HydrocarbonFieldDTO>> {
    const response = await axiosInstance.get<Page<HydrocarbonFieldDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all hydrocarbon fields without pagination
   */
  static async getAllNoPagination(): Promise<HydrocarbonFieldDTO[]> {
    const response = await axiosInstance.get<HydrocarbonFieldDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get hydrocarbon field by ID
   */
  static async getById(id: number): Promise<HydrocarbonFieldDTO> {
    const response = await axiosInstance.get<HydrocarbonFieldDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new hydrocarbon field
   * Validates that code doesn't already exist
   */
  static async create(dto: HydrocarbonFieldDTO): Promise<HydrocarbonFieldDTO> {
    const response = await axiosInstance.post<HydrocarbonFieldDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing hydrocarbon field
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: HydrocarbonFieldDTO): Promise<HydrocarbonFieldDTO> {
    const response = await axiosInstance.put<HydrocarbonFieldDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete hydrocarbon field by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all hydrocarbon field fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<HydrocarbonFieldDTO>> {
    const response = await axiosInstance.get<Page<HydrocarbonFieldDTO>>(`${BASE_URL}/search`, {
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
