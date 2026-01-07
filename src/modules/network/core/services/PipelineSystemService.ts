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

import { apiClient } from '@/lib/api-client';
import type { PipelineSystemDTO } from '../dto/PipelineSystemDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/network/core/pipeline-systems';

export class PipelineSystemService {
  /**
   * Get all pipeline systems with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<PipelineSystemDTO>> {
    const response = await apiClient.get<Page<PipelineSystemDTO>>(BASE_URL, {
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
    const response = await apiClient.get<PipelineSystemDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get pipeline system by ID
   */
  static async getById(id: number): Promise<PipelineSystemDTO> {
    const response = await apiClient.get<PipelineSystemDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new pipeline system
   * Validates that code doesn't already exist
   */
  static async create(dto: PipelineSystemDTO): Promise<PipelineSystemDTO> {
    const response = await apiClient.post<PipelineSystemDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing pipeline system
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: PipelineSystemDTO): Promise<PipelineSystemDTO> {
    const response = await apiClient.put<PipelineSystemDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete pipeline system by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all pipeline system fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<PipelineSystemDTO>> {
    const response = await apiClient.get<Page<PipelineSystemDTO>>(`${BASE_URL}/search`, {
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
   * Find pipeline systems by product ID
   */
  static async findByProduct(productId: number): Promise<PipelineSystemDTO[]> {
    const response = await apiClient.get<PipelineSystemDTO[]>(`${BASE_URL}/by-product/${productId}`);
    return response.data;
  }

  /**
   * Find pipeline systems by operational status ID
   */
  static async findByOperationalStatus(operationalStatusId: number): Promise<PipelineSystemDTO[]> {
    const response = await apiClient.get<PipelineSystemDTO[]>(`${BASE_URL}/by-operational-status/${operationalStatusId}`);
    return response.data;
  }

  /**
   * Find pipeline systems by structure ID
   */
  static async findByStructure(structureId: number): Promise<PipelineSystemDTO[]> {
    const response = await apiClient.get<PipelineSystemDTO[]>(`${BASE_URL}/by-structure/${structureId}`);
    return response.data;
  }
}
