/**
 * PipelineSegment Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.PipelineSegmentService
 * 
 * Provides CRUD operations and search functionality for pipeline segments.
 * Pipeline segments are physical sections of a pipeline between two points.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { PipelineSegmentDTO } from '../dto/PipelineSegmentDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/network/core/pipeline-segments';

export class PipelineSegmentService {
  /**
   * Get all pipeline segments with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<PipelineSegmentDTO>> {
    const response = await apiClient.get<Page<PipelineSegmentDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all pipeline segments without pagination
   */
  static async getAllNoPagination(): Promise<PipelineSegmentDTO[]> {
    const response = await apiClient.get<PipelineSegmentDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get pipeline segment by ID
   */
  static async getById(id: number): Promise<PipelineSegmentDTO> {
    const response = await apiClient.get<PipelineSegmentDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new pipeline segment
   * Validates that code doesn't already exist
   */
  static async create(dto: PipelineSegmentDTO): Promise<PipelineSegmentDTO> {
    const response = await apiClient.post<PipelineSegmentDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing pipeline segment
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: PipelineSegmentDTO): Promise<PipelineSegmentDTO> {
    const response = await apiClient.put<PipelineSegmentDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete pipeline segment by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all pipeline segment fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<PipelineSegmentDTO>> {
    const response = await apiClient.get<Page<PipelineSegmentDTO>>(`${BASE_URL}/search`, {
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
   * Find pipeline segments by pipeline
   */
  static async findByPipeline(pipelineId: number): Promise<PipelineSegmentDTO[]> {
    const response = await apiClient.get<PipelineSegmentDTO[]>(
      `${BASE_URL}/by-pipeline/${pipelineId}`
    );
    return response.data;
  }
}
