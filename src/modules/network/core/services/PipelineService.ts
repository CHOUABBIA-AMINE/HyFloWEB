/**
 * Pipeline Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.PipelineService
 * 
 * Provides CRUD operations and search functionality for pipelines.
 * Pipelines are the main transport infrastructure connecting fields to terminals.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { PipelineDTO } from '../dto/PipelineDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/network/core/pipelines';

export class PipelineService {
  /**
   * Get all pipelines with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<PipelineDTO>> {
    const response = await apiClient.get<Page<PipelineDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all pipelines without pagination
   */
  static async getAllNoPagination(): Promise<PipelineDTO[]> {
    const response = await apiClient.get<PipelineDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get pipeline by ID
   */
  static async getById(id: number): Promise<PipelineDTO> {
    const response = await apiClient.get<PipelineDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new pipeline
   * Validates that code doesn't already exist
   */
  static async create(dto: PipelineDTO): Promise<PipelineDTO> {
    const response = await apiClient.post<PipelineDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing pipeline
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: PipelineDTO): Promise<PipelineDTO> {
    const response = await apiClient.put<PipelineDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete pipeline by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all pipeline fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<PipelineDTO>> {
    const response = await apiClient.get<Page<PipelineDTO>>(`${BASE_URL}/search`, {
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
   * Find pipelines by pipeline system
   */
  static async findByPipelineSystem(systemId: number): Promise<PipelineDTO[]> {
    const response = await apiClient.get<PipelineDTO[]>(
      `${BASE_URL}/by-pipeline-system/${systemId}`
    );
    return response.data;
  }
}
