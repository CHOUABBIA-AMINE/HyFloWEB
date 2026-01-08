/**
 * Infrastructure Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.InfrastructureService
 * 
 * Provides CRUD operations and search functionality for infrastructure.
 * Infrastructure represents major physical assets and installations.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { InfrastructureDTO } from '../dto/InfrastructureDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/infrastructure';

export class InfrastructureService {
  /**
   * Get all infrastructures with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<InfrastructureDTO>> {
    const response = await axiosInstance.get<Page<InfrastructureDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all infrastructures without pagination
   */
  static async getAllNoPagination(): Promise<InfrastructureDTO[]> {
    const response = await axiosInstance.get<InfrastructureDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get infrastructure by ID
   */
  static async getById(id: number): Promise<InfrastructureDTO> {
    const response = await axiosInstance.get<InfrastructureDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new infrastructure
   * Validates that code doesn't already exist
   */
  static async create(dto: InfrastructureDTO): Promise<InfrastructureDTO> {
    const response = await axiosInstance.post<InfrastructureDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing infrastructure
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: InfrastructureDTO): Promise<InfrastructureDTO> {
    const response = await axiosInstance.put<InfrastructureDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete infrastructure by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all infrastructure fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<InfrastructureDTO>> {
    const response = await axiosInstance.get<Page<InfrastructureDTO>>(`${BASE_URL}/search`, {
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
