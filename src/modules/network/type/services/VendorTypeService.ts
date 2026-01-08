/**
 * VendorType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.VendorTypeService
 * 
 * Provides CRUD operations and search functionality for vendor types.
 * Vendor types categorize suppliers (Manufacturer, Distributor, Service Provider, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { VendorTypeDTO } from '../dto/VendorTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/vendor';

export class VendorTypeService {
  /**
   * Get all vendor types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<VendorTypeDTO>> {
    const response = await axiosInstance.get<Page<VendorTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get vendor type by ID
   */
  static async getById(id: number): Promise<VendorTypeDTO> {
    const response = await axiosInstance.get<VendorTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new vendor type
   */
  static async create(dto: VendorTypeDTO): Promise<VendorTypeDTO> {
    const response = await axiosInstance.post<VendorTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing vendor type
   */
  static async update(id: number, dto: VendorTypeDTO): Promise<VendorTypeDTO> {
    const response = await axiosInstance.put<VendorTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete vendor type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all vendor type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<VendorTypeDTO>> {
    const response = await axiosInstance.get<Page<VendorTypeDTO>>(`${BASE_URL}/search`, {
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
