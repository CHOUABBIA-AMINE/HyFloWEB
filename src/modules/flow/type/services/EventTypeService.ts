/**
 * EventType Service - Flow Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.type.service.EventTypeService
 * 
 * Provides CRUD operations and search functionality for event types.
 * Event types classify operational activities and incidents in the flow system.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { EventTypeDTO } from '../dto/EventTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/type/event';

export class EventTypeService {
  /**
   * Get all event types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<EventTypeDTO>> {
    const response = await axiosInstance.get<Page<EventTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all event types without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<EventTypeDTO[]> {
    const response = await axiosInstance.get<EventTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get event type by ID
   */
  static async getById(id: number): Promise<EventTypeDTO> {
    const response = await axiosInstance.get<EventTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get event type by code
   * Examples: EMERGENCY_SHUTDOWN, MAINTENANCE, SHUTDOWN, LEAK, etc.
   */
  static async getByCode(code: string): Promise<EventTypeDTO> {
    const response = await axiosInstance.get<EventTypeDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new event type
   * Validates that code doesn't already exist
   * Code must match pattern: ^[A-Z0-9_-]+$
   */
  static async create(dto: EventTypeDTO): Promise<EventTypeDTO> {
    const response = await axiosInstance.post<EventTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing event type
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: EventTypeDTO): Promise<EventTypeDTO> {
    const response = await axiosInstance.put<EventTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete event type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all event type fields
   * Searches in code and designation fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<EventTypeDTO>> {
    const response = await axiosInstance.get<Page<EventTypeDTO>>(`${BASE_URL}/search`, {
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
   * Check if event type code exists
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
   * Get event types by severity
   * Returns event types commonly associated with a severity level
   */
  static async getBySeverity(severityId: number): Promise<EventTypeDTO[]> {
    const response = await axiosInstance.get<EventTypeDTO[]>(`${BASE_URL}/severity/${severityId}`);
    return response.data;
  }
}
