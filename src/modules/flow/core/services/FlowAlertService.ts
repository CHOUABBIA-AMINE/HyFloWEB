/**
 * FlowAlert Service - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.service.FlowAlertService
 * 
 * Provides CRUD operations and search functionality for flow alerts.
 * Flow alerts notify about threshold breaches in flow measurements.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowAlertDTO } from '../dto/FlowAlertDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/flowAlert';

export class FlowAlertService {
  /**
   * Get all flow alerts with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FlowAlertDTO>> {
    const response = await axiosInstance.get<Page<FlowAlertDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all flow alerts without pagination
   */
  static async getAllNoPagination(): Promise<FlowAlertDTO[]> {
    const response = await axiosInstance.get<FlowAlertDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get flow alert by ID
   */
  static async getById(id: number): Promise<FlowAlertDTO> {
    const response = await axiosInstance.get<FlowAlertDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new flow alert
   * Typically triggered automatically by threshold monitoring
   */
  static async create(dto: FlowAlertDTO): Promise<FlowAlertDTO> {
    const response = await axiosInstance.post<FlowAlertDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing flow alert
   */
  static async update(id: number, dto: FlowAlertDTO): Promise<FlowAlertDTO> {
    const response = await axiosInstance.put<FlowAlertDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete flow alert by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all flow alert fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FlowAlertDTO>> {
    const response = await axiosInstance.get<Page<FlowAlertDTO>>(`${BASE_URL}/search`, {
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
   * Get alerts by threshold
   */
  static async getByThreshold(
    thresholdId: number,
    pageable: Pageable
  ): Promise<Page<FlowAlertDTO>> {
    const response = await axiosInstance.get<Page<FlowAlertDTO>>(
      `${BASE_URL}/threshold/${thresholdId}`,
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
   * Get alerts by status
   */
  static async getByStatus(
    statusId: number,
    pageable: Pageable
  ): Promise<Page<FlowAlertDTO>> {
    const response = await axiosInstance.get<Page<FlowAlertDTO>>(
      `${BASE_URL}/status/${statusId}`,
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
   * Get active alerts
   * Returns alerts with ACTIVE status
   */
  static async getActive(pageable: Pageable): Promise<Page<FlowAlertDTO>> {
    const response = await axiosInstance.get<Page<FlowAlertDTO>>(`${BASE_URL}/active`, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get unacknowledged alerts
   * Returns alerts that haven't been acknowledged yet
   */
  static async getUnacknowledged(pageable: Pageable): Promise<Page<FlowAlertDTO>> {
    const response = await axiosInstance.get<Page<FlowAlertDTO>>(`${BASE_URL}/unacknowledged`, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get alerts by date range
   */
  static async getByDateRange(
    startDate: string,
    endDate: string,
    pageable: Pageable
  ): Promise<Page<FlowAlertDTO>> {
    const response = await axiosInstance.get<Page<FlowAlertDTO>>(`${BASE_URL}/dateRange`, {
      params: {
        startDate,
        endDate,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Acknowledge alert
   * Updates acknowledgment timestamp and acknowledgedBy
   */
  static async acknowledge(id: number, acknowledgedById: number): Promise<FlowAlertDTO> {
    const response = await axiosInstance.post<FlowAlertDTO>(`${BASE_URL}/${id}/acknowledge`, {
      acknowledgedById,
    });
    return response.data;
  }

  /**
   * Resolve alert
   * Marks alert as resolved with resolution notes
   */
  static async resolve(
    id: number,
    resolvedById: number,
    resolutionNotes: string
  ): Promise<FlowAlertDTO> {
    const response = await axiosInstance.post<FlowAlertDTO>(`${BASE_URL}/${id}/resolve`, {
      resolvedById,
      resolutionNotes,
    });
    return response.data;
  }

  /**
   * Dismiss alert
   * Marks alert as dismissed without resolution
   */
  static async dismiss(id: number): Promise<FlowAlertDTO> {
    const response = await axiosInstance.post<FlowAlertDTO>(`${BASE_URL}/${id}/dismiss`);
    return response.data;
  }

  /**
   * Get alert count by status
   */
  static async getCountByStatus(): Promise<Record<string, number>> {
    const response = await axiosInstance.get<Record<string, number>>(`${BASE_URL}/count/status`);
    return response.data;
  }
}
