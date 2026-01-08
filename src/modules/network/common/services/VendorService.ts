/**
 * Vendor Service - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.service.VendorService
 * 
 * Provides CRUD operations and search functionality for vendors.
 * Vendors represent suppliers and manufacturers of equipment and materials.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { VendorDTO } from '../dto/VendorDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/common/vendors';

export class VendorService {
  /**
   * Get all vendors with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<VendorDTO>> {
    const response = await axiosInstance.get<Page<VendorDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get vendor by ID
   */
  static async getById(id: number): Promise<VendorDTO> {
    const response = await axiosInstance.get<VendorDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new vendor
   */
  static async create(dto: VendorDTO): Promise<VendorDTO> {
    const response = await axiosInstance.post<VendorDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing vendor
   */
  static async update(id: number, dto: VendorDTO): Promise<VendorDTO> {
    const response = await axiosInstance.put<VendorDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete vendor by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all vendor fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<VendorDTO>> {
    const response = await axiosInstance.get<Page<VendorDTO>>(`${BASE_URL}/search`, {
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
