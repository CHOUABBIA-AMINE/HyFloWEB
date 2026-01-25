/**
 * FlowEvent Service - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.service.FlowEventService
 * 
 * Provides CRUD operations and search functionality for flow events.
 * Flow events track operational activities and incidents (maintenance, shutdowns, leaks, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowEventDTO } from '../dto/FlowEventDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/flowEvent';

export class FlowEventService {
  /**
   * Get all flow events with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all flow events without pagination
   */
  static async getAllNoPagination(): Promise<FlowEventDTO[]> {
    const response = await axiosInstance.get<FlowEventDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get flow event by ID
   */
  static async getById(id: number): Promise<FlowEventDTO> {
    const response = await axiosInstance.get<FlowEventDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new flow event
   */
  static async create(dto: FlowEventDTO): Promise<FlowEventDTO> {
    const response = await axiosInstance.post<FlowEventDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing flow event
   */
  static async update(id: number, dto: FlowEventDTO): Promise<FlowEventDTO> {
    const response = await axiosInstance.put<FlowEventDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete flow event by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all flow event fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(`${BASE_URL}/search`, {
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
   * Get events by infrastructure
   */
  static async getByInfrastructure(
    infrastructureId: number,
    pageable: Pageable
  ): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(
      `${BASE_URL}/infrastructure/${infrastructureId}`,
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
   * Get events by event type
   */
  static async getByType(
    typeId: number,
    pageable: Pageable
  ): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(
      `${BASE_URL}/type/${typeId}`,
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
   * Get events by severity
   */
  static async getBySeverity(
    severityId: number,
    pageable: Pageable
  ): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(
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
   * Get events by status
   */
  static async getByStatus(
    statusId: number,
    pageable: Pageable
  ): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(
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
   * Get ongoing events
   * Returns events with IN_PROGRESS status
   */
  static async getOngoing(pageable: Pageable): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(`${BASE_URL}/ongoing`, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get events by date range
   */
  static async getByDateRange(
    startDate: string,
    endDate: string,
    pageable: Pageable
  ): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(`${BASE_URL}/dateRange`, {
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
   * Get critical events
   * Returns events with CRITICAL or HIGH severity
   */
  static async getCritical(pageable: Pageable): Promise<Page<FlowEventDTO>> {
    const response = await axiosInstance.get<Page<FlowEventDTO>>(`${BASE_URL}/critical`, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Complete event
   * Marks event as COMPLETED and sets end time
   */
  static async complete(
    id: number,
    resolvedById: number,
    resolution: string
  ): Promise<FlowEventDTO> {
    const response = await axiosInstance.post<FlowEventDTO>(`${BASE_URL}/${id}/complete`, {
      resolvedById,
      resolution,
    });
    return response.data;
  }

  /**
   * Cancel event
   * Marks event as CANCELLED
   */
  static async cancel(id: number): Promise<FlowEventDTO> {
    const response = await axiosInstance.post<FlowEventDTO>(`${BASE_URL}/${id}/cancel`);
    return response.data;
  }

  /**
   * Get event count by severity
   */
  static async getCountBySeverity(): Promise<Record<string, number>> {
    const response = await axiosInstance.get<Record<string, number>>(
      `${BASE_URL}/count/severity`
    );
    return response.data;
  }
}
