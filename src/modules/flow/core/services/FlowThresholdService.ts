/**
 * FlowThreshold Service - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.service.FlowThresholdService
 * 
 * Provides CRUD operations and search functionality for flow thresholds.
 * Flow thresholds define acceptable ranges for measurements (pressure, temperature, flow rate).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowThresholdDTO } from '../dto/FlowThresholdDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/flowThreshold';

export class FlowThresholdService {
  /**
   * Get all flow thresholds with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all flow thresholds without pagination
   */
  static async getAllNoPagination(): Promise<FlowThresholdDTO[]> {
    const response = await axiosInstance.get<FlowThresholdDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get flow threshold by ID
   */
  static async getById(id: number): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.get<FlowThresholdDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new flow threshold
   * Validates that min < max values
   */
  static async create(dto: FlowThresholdDTO): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.post<FlowThresholdDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing flow threshold
   */
  static async update(id: number, dto: FlowThresholdDTO): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.put<FlowThresholdDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete flow threshold by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all flow threshold fields
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
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get thresholds by pipeline
   */
  static async getByPipeline(
    pipelineId: number,
    pageable: Pageable
  ): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(
      `${BASE_URL}/pipeline/${pipelineId}`,
      {
        params: {
          page: pageable.page,
          size: pageable.size,
          sort: pageable.sort,
        },
      }
    );
    return response.data;
  }

  /**
   * Get active thresholds by pipeline
   * Returns only thresholds with isActive = true
   */
  static async getActivByPipeline(pipelineId: number): Promise<FlowThresholdDTO[]> {
    const response = await axiosInstance.get<FlowThresholdDTO[]>(
      `${BASE_URL}/pipeline/${pipelineId}/active`
    );
    return response.data;
  }

  /**
   * Get thresholds by severity
   */
  static async getBySeverity(
    severityId: number,
    pageable: Pageable
  ): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(
      `${BASE_URL}/severity/${severityId}`,
      {
        params: {
          page: pageable.page,
          size: pageable.size,
          sort: pageable.sort,
        },
      }
    );
    return response.data;
  }

  /**
   * Check if value breaches threshold
   * Returns true if value is outside threshold range
   */
  static async checkBreach(thresholdId: number, value: number): Promise<boolean> {
    const response = await axiosInstance.post<boolean>(`${BASE_URL}/${thresholdId}/checkBreach`, {
      value,
    });
    return response.data;
  }

  /**
   * Activate threshold
   * Sets isActive to true
   */
  static async activate(id: number): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.post<FlowThresholdDTO>(`${BASE_URL}/${id}/activate`);
    return response.data;
  }

  /**
   * Deactivate threshold
   * Sets isActive to false
   */
  static async deactivate(id: number): Promise<FlowThresholdDTO> {
    const response = await axiosInstance.post<FlowThresholdDTO>(`${BASE_URL}/${id}/deactivate`);
    return response.data;
  }

  /**
   * Get critical thresholds
   * Returns thresholds with CRITICAL severity
   */
  static async getCritical(pageable: Pageable): Promise<Page<FlowThresholdDTO>> {
    const response = await axiosInstance.get<Page<FlowThresholdDTO>>(`${BASE_URL}/critical`, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }
}
