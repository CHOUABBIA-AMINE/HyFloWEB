/**
 * Severity Service - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.service.SeverityService
 * 
 * Provides CRUD operations and search functionality for severity levels.
 * Severity levels classify the criticality of alerts and events (LOW, MEDIUM, HIGH, CRITICAL).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { SeverityDTO } from '../dto/SeverityDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/common/severity';

export class SeverityService {
  /**
   * Get all severity levels with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<SeverityDTO>> {
    const response = await axiosInstance.get<Page<SeverityDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all severity levels without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<SeverityDTO[]> {
    const response = await axiosInstance.get<SeverityDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get severity level by ID
   */
  static async getById(id: number): Promise<SeverityDTO> {
    const response = await axiosInstance.get<SeverityDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get severity level by code
   * Codes: LOW, MEDIUM, HIGH, CRITICAL
   */
  static async getByCode(code: string): Promise<SeverityDTO> {
    const response = await axiosInstance.get<SeverityDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new severity level
   * Validates that code doesn't already exist
   * Code must match pattern: ^[A-Z0-9_-]+$ (2-20 chars)
   */
  static async create(dto: SeverityDTO): Promise<SeverityDTO> {
    const response = await axiosInstance.post<SeverityDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing severity level
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: SeverityDTO): Promise<SeverityDTO> {
    const response = await axiosInstance.put<SeverityDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete severity level by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all severity fields
   * Searches in code, designation, and description fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<SeverityDTO>> {
    const response = await axiosInstance.get<Page<SeverityDTO>>(`${BASE_URL}/search`, {
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
   * Check if severity code exists
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
   * Get severity levels ordered by priority
   * Returns severity levels from LOW to CRITICAL
   */
  static async getOrderedByPriority(): Promise<SeverityDTO[]> {
    const response = await axiosInstance.get<SeverityDTO[]>(`${BASE_URL}/ordered`);
    return response.data;
  }

  /**
   * Get critical severity levels
   * Returns HIGH and CRITICAL severity levels
   */
  static async getCriticalLevels(): Promise<SeverityDTO[]> {
    const response = await axiosInstance.get<SeverityDTO[]>(`${BASE_URL}/critical`);
    return response.data;
  }
}
