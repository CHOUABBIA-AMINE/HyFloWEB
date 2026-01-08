/**
 * Partner Service - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.service.PartnerService
 * 
 * Provides CRUD operations and search functionality for partners.
 * Partners represent organizations or companies involved in the hydrocarbon network.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { PartnerDTO } from '../dto/PartnerDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/common/partner';

export class PartnerService {
  /**
   * Get all partners with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<PartnerDTO>> {
    const response = await axiosInstance.get<Page<PartnerDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get partner by ID
   */
  static async getById(id: number): Promise<PartnerDTO> {
    const response = await axiosInstance.get<PartnerDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new partner
   * Validates that shortName doesn't already exist
   */
  static async create(dto: PartnerDTO): Promise<PartnerDTO> {
    const response = await axiosInstance.post<PartnerDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing partner
   * Validates that shortName doesn't exist for other records
   */
  static async update(id: number, dto: PartnerDTO): Promise<PartnerDTO> {
    const response = await axiosInstance.put<PartnerDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete partner by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all partner fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<PartnerDTO>> {
    const response = await axiosInstance.get<Page<PartnerDTO>>(`${BASE_URL}/search`, {
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
