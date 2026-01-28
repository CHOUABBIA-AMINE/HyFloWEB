/**
 * FlowThreshold Service - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.service.FlowThresholdService
 * Backend Controller: dz.sh.trc.hyflo.flow.core.controller.FlowThresholdController
 * 
 * Provides CRUD operations and search functionality for flow thresholds.
 * Flow thresholds define acceptable ranges for measurements (pressure, temperature, flow rate).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-23-2026
 * @updated 01-28-2026 - Aligned with backend controller endpoints
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowThresholdDTO } from '../dto/FlowThresholdDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/threshold';

export class FlowThresholdService {
  // ========== CRUD OPERATIONS ==========
  
  /**
   * Get all flow thresholds with pagination
   * @secured FLOW_THRESHOLD:READ
   */
  static async getAll(pageable: Pageable): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sortBy: pageable.sort?.split(',')[0] || 'id',
        sortDir: pageable.sort?.split(',')[1] || 'asc',
      },
    });
    return response.data;
  }

  /**
   * Get all flow thresholds without pagination
   * @secured FLOW_THRESHOLD:READ
   */
  static async getAllNoPagination(): Promise<FlowThresholdDTO[]> {
    const response = await axiosInstance.get<FlowThresholdDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get flow threshold by ID
   * @secured FLOW_THRESHOLD:READ
   */
  static async getById(id: number): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.get<FlowThresholdDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new flow threshold
   * Validates that min < max values and checks for duplicate pipeline
   * @secured FLOW_THRESHOLD:WRITE
   * @throws BusinessValidationException if threshold for pipeline already exists
   */
  static async create(dto: FlowThresholdDTO): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.post<FlowThresholdDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing flow threshold
   * @secured FLOW_THRESHOLD:WRITE
   * @throws BusinessValidationException if threshold for pipeline already exists (except current)
   */
  static async update(id: number, dto: FlowThresholdDTO): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.put<FlowThresholdDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete flow threshold by ID
   * @secured FLOW_THRESHOLD:ADMIN
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Check if threshold exists
   * @secured FLOW_THRESHOLD:READ
   */
  static async exists(id: number): Promise<boolean> {
    const response = await axiosInstance.get<boolean>(`${BASE_URL}/${id}/exists`);
    return response.data;
  }

  /**
   * Get total count of thresholds
   * @secured FLOW_THRESHOLD:READ
   */
  static async count(): Promise<number> {
    const response = await axiosInstance.get<number>(`${BASE_URL}/count`);
    return response.data;
  }

  // ========== SEARCH & FILTER OPERATIONS ==========

  /**
   * Global search across all flow threshold fields
   * @secured FLOW_THRESHOLD:READ
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(`${BASE_URL}/search`, {
      params: {
        q: searchTerm,
        page: pageable.page,
        size: pageable.size,
        sortBy: pageable.sort?.split(',')[0] || 'id',
        sortDir: pageable.sort?.split(',')[1] || 'asc',
      },
    });
    return response.data;
  }

  // ========== PIPELINE OPERATIONS ==========

  /**
   * Get thresholds by pipeline (all, not paginated)
   * Returns all thresholds for a specific pipeline
   * @secured FLOW_THRESHOLD:READ
   */
  static async getByPipeline(pipelineId: number): Promise<FlowThresholdDTO[]> {
    const response = await axiosInstance.get<FlowThresholdDTO[]>(
      `${BASE_URL}/pipeline/${pipelineId}`
    );
    return response.data;
  }

  // ========== ACTIVE STATUS OPERATIONS ==========

  /**
   * Get all active thresholds with pagination
   * Returns only thresholds with active = true
   * @secured FLOW_THRESHOLD:READ
   */
  static async getActive(pageable: Pageable): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(`${BASE_URL}/active`, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sortBy: pageable.sort?.split(',')[0] || 'id',
        sortDir: pageable.sort?.split(',')[1] || 'asc',
      },
    });
    return response.data;
  }

  /**
   * Get active thresholds by pipeline with pagination
   * Returns only active thresholds for a specific pipeline
   * @secured FLOW_THRESHOLD:READ
   */
  static async getActiveByPipeline(
    pipelineId: number,
    pageable: Pageable
  ): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(
      `${BASE_URL}/pipeline/${pipelineId}/active`,
      {
        params: {
          page: pageable.page,
          size: pageable.size,
          sortBy: pageable.sort?.split(',')[0] || 'id',
          sortDir: pageable.sort?.split(',')[1] || 'asc',
        },
      }
    );
    return response.data;
  }
}

/**
 * API Endpoint Summary:
 * 
 * CRUD Operations:
 * - GET    /flow/core/threshold                                  -> getAll() paginated
 * - GET    /flow/core/threshold/all                             -> getAllNoPagination()
 * - GET    /flow/core/threshold/{id}                            -> getById()
 * - POST   /flow/core/threshold                                 -> create()
 * - PUT    /flow/core/threshold/{id}                            -> update()
 * - DELETE /flow/core/threshold/{id}                            -> delete()
 * - GET    /flow/core/threshold/{id}/exists                     -> exists()
 * - GET    /flow/core/threshold/count                           -> count()
 * 
 * Search & Filter:
 * - GET    /flow/core/threshold/search?q=term                   -> globalSearch()
 * 
 * Pipeline Operations:
 * - GET    /flow/core/threshold/pipeline/{pipelineId}           -> getByPipeline()
 * 
 * Active Status:
 * - GET    /flow/core/threshold/active                          -> getActive() paginated
 * - GET    /flow/core/threshold/pipeline/{pipelineId}/active   -> getActiveByPipeline() paginated
 * 
 * Security:
 * - READ operations require: FLOW_THRESHOLD:READ
 * - WRITE operations require: FLOW_THRESHOLD:WRITE
 * - DELETE operations require: FLOW_THRESHOLD:ADMIN
 */
