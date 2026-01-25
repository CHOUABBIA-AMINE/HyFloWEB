/**
 * ValidationStatus Service - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.service.ValidationStatusService
 * 
 * Provides CRUD operations and search functionality for validation statuses.
 * Validation statuses track the verification state of flow data (DRAFT, PENDING, VALIDATED, REJECTED, ARCHIVED).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { ValidationStatusDTO } from '../dto/ValidationStatusDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/common/validationStatus';

export class ValidationStatusService {
  /**
   * Get all validation statuses with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<ValidationStatusDTO>> {
    const response = await axiosInstance.get<Page<ValidationStatusDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all validation statuses without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<ValidationStatusDTO[]> {
    const response = await axiosInstance.get<ValidationStatusDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get validation status by ID
   */
  static async getById(id: number): Promise<ValidationStatusDTO> {
    const response = await axiosInstance.get<ValidationStatusDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get validation status by code
   * Codes: DRAFT, PENDING, VALIDATED, REJECTED, ARCHIVED
   */
  static async getByCode(code: string): Promise<ValidationStatusDTO> {
    const response = await axiosInstance.get<ValidationStatusDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new validation status
   * Validates that code doesn't already exist
   * Code must match pattern: ^[A-Z0-9_-]+$ (2-20 chars)
   */
  static async create(dto: ValidationStatusDTO): Promise<ValidationStatusDTO> {
    const response = await axiosInstance.post<ValidationStatusDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing validation status
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: ValidationStatusDTO): Promise<ValidationStatusDTO> {
    const response = await axiosInstance.put<ValidationStatusDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete validation status by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all validation status fields
   * Searches in code, designation, and description fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<ValidationStatusDTO>> {
    const response = await axiosInstance.get<Page<ValidationStatusDTO>>(`${BASE_URL}/search`, {
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
   * Check if validation status code exists
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
}
