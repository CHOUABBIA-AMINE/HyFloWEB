/**
 * Alloy Service - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.service.AlloyService
 * 
 * Provides CRUD operations and search functionality for alloys.
 * Alloys represent the material composition used in pipelines and infrastructure.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { AlloyDTO } from '../dto/AlloyDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/common/alloys';

export class AlloyService {
  /**
   * Get all alloys with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<AlloyDTO>> {
    const response = await axiosInstance.get<Page<AlloyDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all alloys without pagination
   */
  static async getAllNoPagination(): Promise<AlloyDTO[]> {
    const response = await axiosInstance.get<AlloyDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get alloy by ID
   */
  static async getById(id: number): Promise<AlloyDTO> {
    const response = await axiosInstance.get<AlloyDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new alloy
   * Validates that code doesn't already exist
   */
  static async create(dto: AlloyDTO): Promise<AlloyDTO> {
    const response = await axiosInstance.post<AlloyDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing alloy
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: AlloyDTO): Promise<AlloyDTO> {
    const response = await axiosInstance.put<AlloyDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete alloy by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all alloy fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<AlloyDTO>> {
    const response = await axiosInstance.get<Page<AlloyDTO>>(`${BASE_URL}/search`, {
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
