/**
 * PartnerType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.PartnerTypeService
 * 
 * Provides CRUD operations and search functionality for partner types.
 * Partner types categorize organizations (Operator, Contractor, Supplier, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { PartnerTypeDTO } from '../dto/PartnerTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/network/type/partner-types';

export class PartnerTypeService {
  /**
   * Get all partner types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<PartnerTypeDTO>> {
    const response = await apiClient.get<Page<PartnerTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get partner type by ID
   */
  static async getById(id: number): Promise<PartnerTypeDTO> {
    const response = await apiClient.get<PartnerTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new partner type
   */
  static async create(dto: PartnerTypeDTO): Promise<PartnerTypeDTO> {
    const response = await apiClient.post<PartnerTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing partner type
   */
  static async update(id: number, dto: PartnerTypeDTO): Promise<PartnerTypeDTO> {
    const response = await apiClient.put<PartnerTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete partner type by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all partner type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<PartnerTypeDTO>> {
    const response = await apiClient.get<Page<PartnerTypeDTO>>(`${BASE_URL}/search`, {
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
