/**
 * PipelineSystem Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.PipelineSystemService
 * 
 * Provides CRUD operations and search functionality for pipeline systems.
 * Pipeline systems are collections of related pipelines forming a complete network.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { PipelineSystemDTO } from '../dto/PipelineSystemDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/pipelineSystem';

export class PipelineSystemService {
  /**
   * Get all pipeline systems with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<PipelineSystemDTO>> {
    const response = await axiosInstance.get<Page<PipelineSystemDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all pipeline systems without pagination
   */
  static async getAllNoPagination(): Promise<PipelineSystemDTO[]> {
    const response = await axiosInstance.get<PipelineSystemDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get pipeline system by ID
   */
  static async getById(id: number): Promise<PipelineSystemDTO> {
    const response = await axiosInstance.get<PipelineSystemDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new pipeline system
   * Validates that code doesn't already exist
   */
  static async create(dto: PipelineSystemDTO): Promise<PipelineSystemDTO> {
    const response = await axiosInstance.post<PipelineSystemDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing pipeline system
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: PipelineSystemDTO): Promise<PipelineSystemDTO> {
    const response = await axiosInstance.put<PipelineSystemDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete pipeline system by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all pipeline system fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<PipelineSystemDTO>> {
    const response = await axiosInstance.get<Page<PipelineSystemDTO>>(`${BASE_URL}/search`, {
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
   * Find pipeline systems by product
   */
  static async findByProduct(productId: number): Promise<PipelineSystemDTO[]> {
    const response = await axiosInstance.get<PipelineSystemDTO[]>(
      `${BASE_URL}/product/${productId}`
    );
    return response.data;
  }
}
