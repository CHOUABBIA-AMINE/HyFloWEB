/**
 * HydrocarbonFieldType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.HydrocarbonFieldTypeService
 * 
 * Provides CRUD operations and search functionality for hydrocarbon field types.
 * Field types categorize geological formations (Oil Field, Gas Field, Condensate Field, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { HydrocarbonFieldTypeDTO } from '../dto/HydrocarbonFieldTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/hydrocarbonField';

export class HydrocarbonFieldTypeService {
  /**
   * Get all hydrocarbon field types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<HydrocarbonFieldTypeDTO>> {
    const response = await axiosInstance.get<Page<HydrocarbonFieldTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get hydrocarbon field type by ID
   */
  static async getById(id: number): Promise<HydrocarbonFieldTypeDTO> {
    const response = await axiosInstance.get<HydrocarbonFieldTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new hydrocarbon field type
   */
  static async create(dto: HydrocarbonFieldTypeDTO): Promise<HydrocarbonFieldTypeDTO> {
    const response = await axiosInstance.post<HydrocarbonFieldTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing hydrocarbon field type
   */
  static async update(id: number, dto: HydrocarbonFieldTypeDTO): Promise<HydrocarbonFieldTypeDTO> {
    const response = await axiosInstance.put<HydrocarbonFieldTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete hydrocarbon field type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all hydrocarbon field type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<HydrocarbonFieldTypeDTO>> {
    const response = await axiosInstance.get<Page<HydrocarbonFieldTypeDTO>>(`${BASE_URL}/search`, {
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
