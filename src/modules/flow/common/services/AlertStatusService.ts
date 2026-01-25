/**
 * AlertStatus Service - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.service.AlertStatusService
 * 
 * Provides CRUD operations and search functionality for alert statuses.
 * Alert statuses track the lifecycle of alerts (ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { AlertStatusDTO } from '../dto/AlertStatusDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/common/alertStatus';

export class AlertStatusService {
  /**
   * Get all alert statuses with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<AlertStatusDTO>> {
    const response = await axiosInstance.get<Page<AlertStatusDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all alert statuses without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<AlertStatusDTO[]> {
    const response = await axiosInstance.get<AlertStatusDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get alert status by ID
   */
  static async getById(id: number): Promise<AlertStatusDTO> {
    const response = await axiosInstance.get<AlertStatusDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get alert status by code
   * Codes: ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
   */
  static async getByCode(code: string): Promise<AlertStatusDTO> {
    const response = await axiosInstance.get<AlertStatusDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new alert status
   * Validates that code doesn't already exist
   * Code must match pattern: ^[A-Z0-9_-]+$ (2-20 chars)
   */
  static async create(dto: AlertStatusDTO): Promise<AlertStatusDTO> {
    const response = await axiosInstance.post<AlertStatusDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing alert status
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: AlertStatusDTO): Promise<AlertStatusDTO> {
    const response = await axiosInstance.put<AlertStatusDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete alert status by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all alert status fields
   * Searches in code, designation, and description fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<AlertStatusDTO>> {
    const response = await axiosInstance.get<Page<AlertStatusDTO>>(`${BASE_URL}/search`, {
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
   * Check if alert status code exists
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
   * Get active alert statuses
   * Returns statuses that represent active/unresolved alerts
   */
  static async getActiveStatuses(): Promise<AlertStatusDTO[]> {
    const response = await axiosInstance.get<AlertStatusDTO[]>(`${BASE_URL}/active`);
    return response.data;
  }
}
