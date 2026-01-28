/**
 * ValidationStatus Service - Flow Common Module
 * 
 * Provides CRUD operations for validation statuses.
 * Validation statuses are used to track the lifecycle of flow readings.
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
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
   */
  static async getByCode(code: string): Promise<ValidationStatusDTO> {
    const response = await axiosInstance.get<ValidationStatusDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new validation status
   */
  static async create(dto: ValidationStatusDTO): Promise<ValidationStatusDTO> {
    const response = await axiosInstance.post<ValidationStatusDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing validation status
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
   * Search validation statuses
   */
  static async search(
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
}
