/**
 * EventStatus Service - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.service.EventStatusService
 * 
 * Provides CRUD operations and search functionality for event statuses.
 * Event statuses track the lifecycle of events (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { EventStatusDTO } from '../dto/EventStatusDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/common/eventStatus';

export class EventStatusService {
  /**
   * Get all event statuses with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<EventStatusDTO>> {
    const response = await axiosInstance.get<Page<EventStatusDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all event statuses without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<EventStatusDTO[]> {
    const response = await axiosInstance.get<EventStatusDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get event status by ID
   */
  static async getById(id: number): Promise<EventStatusDTO> {
    const response = await axiosInstance.get<EventStatusDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get event status by code
   * Codes: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
   */
  static async getByCode(code: string): Promise<EventStatusDTO> {
    const response = await axiosInstance.get<EventStatusDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new event status
   * Validates that code doesn't already exist
   * Code must match pattern: ^[A-Z0-9_-]+$ (2-20 chars)
   */
  static async create(dto: EventStatusDTO): Promise<EventStatusDTO> {
    const response = await axiosInstance.post<EventStatusDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing event status
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: EventStatusDTO): Promise<EventStatusDTO> {
    const response = await axiosInstance.put<EventStatusDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete event status by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all event status fields
   * Searches in code, designation, and description fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<EventStatusDTO>> {
    const response = await axiosInstance.get<Page<EventStatusDTO>>(`${BASE_URL}/search`, {
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
   * Check if event status code exists
   * Useful for validation before create/update
   */
  static async codeExists(code: string, excludeId?: number): Promise<boolean> {
    const response = await axiosInstance.get<boolean>(`${BASE_URL}/exists`, {
      params: {
        code,
        excludeId,
      },
    });
    return response.data;
  }

  /**
   * Get ongoing event statuses
   * Returns statuses that represent events in progress
   */
  static async getOngoingStatuses(): Promise<EventStatusDTO[]> {
    const response = await axiosInstance.get<EventStatusDTO[]>(`${BASE_URL}/ongoing`);
    return response.data;
  }
}
