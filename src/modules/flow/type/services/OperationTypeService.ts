/**
 * OperationType Service - Flow Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.type.service.OperationTypeService
 * 
 * Provides CRUD operations and search functionality for operation types.
 * Operation types classify flow operations as PRODUCED, TRANSPORTED, or CONSUMED.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { OperationTypeDTO } from '../dto/OperationTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/type/operation';

export class OperationTypeService {
  /**
   * Get all operation types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<OperationTypeDTO>> {
    const response = await axiosInstance.get<Page<OperationTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all operation types without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<OperationTypeDTO[]> {
    const response = await axiosInstance.get<OperationTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get operation type by ID
   */
  static async getById(id: number): Promise<OperationTypeDTO> {
    const response = await axiosInstance.get<OperationTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get operation type by code
   * Codes: PRODUCED, TRANSPORTED, CONSUMED
   */
  static async getByCode(code: string): Promise<OperationTypeDTO> {
    const response = await axiosInstance.get<OperationTypeDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new operation type
   * Validates that code doesn't already exist
   * Code must be one of: PRODUCED, TRANSPORTED, CONSUMED
   */
  static async create(dto: OperationTypeDTO): Promise<OperationTypeDTO> {
    const response = await axiosInstance.post<OperationTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing operation type
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: OperationTypeDTO): Promise<OperationTypeDTO> {
    const response = await axiosInstance.put<OperationTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete operation type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all operation type fields
   * Searches in code and name fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<OperationTypeDTO>> {
    const response = await axiosInstance.get<Page<OperationTypeDTO>>(`${BASE_URL}/search`, {
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
   * Check if operation type code exists
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
