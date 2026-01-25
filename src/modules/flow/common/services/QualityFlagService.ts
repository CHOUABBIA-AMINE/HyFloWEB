/**
 * QualityFlag Service - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.service.QualityFlagService
 * 
 * Provides CRUD operations and search functionality for quality flags.
 * Quality flags assess flow measurement data quality (GOOD, ESTIMATED, SUSPECT, MISSING, OUT_OF_RANGE).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { QualityFlagDTO } from '../dto/QualityFlagDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/common/qualityFlag';

export class QualityFlagService {
  /**
   * Get all quality flags with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<QualityFlagDTO>> {
    const response = await axiosInstance.get<Page<QualityFlagDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all quality flags without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<QualityFlagDTO[]> {
    const response = await axiosInstance.get<QualityFlagDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get quality flag by ID
   */
  static async getById(id: number): Promise<QualityFlagDTO> {
    const response = await axiosInstance.get<QualityFlagDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get quality flag by code
   * Codes: GOOD, ESTIMATED, SUSPECT, MISSING, OUT_OF_RANGE
   */
  static async getByCode(code: string): Promise<QualityFlagDTO> {
    const response = await axiosInstance.get<QualityFlagDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new quality flag
   * Validates that code doesn't already exist
   * Code must match pattern: ^[A-Z0-9_-]+$ (2-20 chars)
   */
  static async create(dto: QualityFlagDTO): Promise<QualityFlagDTO> {
    const response = await axiosInstance.post<QualityFlagDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing quality flag
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: QualityFlagDTO): Promise<QualityFlagDTO> {
    const response = await axiosInstance.put<QualityFlagDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete quality flag by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all quality flag fields
   * Searches in code, designation, and description fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<QualityFlagDTO>> {
    const response = await axiosInstance.get<Page<QualityFlagDTO>>(`${BASE_URL}/search`, {
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
   * Check if quality flag code exists
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
   * Get acceptable quality flags
   * Returns quality flags that represent valid data (e.g., GOOD)
   */
  static async getAcceptableFlags(): Promise<QualityFlagDTO[]> {
    const response = await axiosInstance.get<QualityFlagDTO[]>(`${BASE_URL}/acceptable`);
    return response.data;
  }

  /**
   * Get problematic quality flags
   * Returns quality flags indicating data issues (e.g., SUSPECT, MISSING, OUT_OF_RANGE)
   */
  static async getProblematicFlags(): Promise<QualityFlagDTO[]> {
    const response = await axiosInstance.get<QualityFlagDTO[]>(`${BASE_URL}/problematic`);
    return response.data;
  }
}
