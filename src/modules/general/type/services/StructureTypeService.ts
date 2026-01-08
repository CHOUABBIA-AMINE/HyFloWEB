/**
 * StructureType Service - General Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.type.service.StructureTypeService
 * 
 * Provides CRUD operations and search functionality for structure types.
 * Structure types represent different organizational structure classifications.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { StructureTypeDTO } from '../dto/StructureTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/type/structure-types';

export class StructureTypeService {
  /**
   * Get all structure types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<StructureTypeDTO>> {
    const response = await axiosInstance.get<Page<StructureTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all structure types without pagination
   */
  static async getAllNoPagination(): Promise<StructureTypeDTO[]> {
    const response = await axiosInstance.get<StructureTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get structure type by ID
   */
  static async getById(id: number): Promise<StructureTypeDTO> {
    const response = await axiosInstance.get<StructureTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new structure type
   */
  static async create(dto: StructureTypeDTO): Promise<StructureTypeDTO> {
    const response = await axiosInstance.post<StructureTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing structure type
   */
  static async update(id: number, dto: StructureTypeDTO): Promise<StructureTypeDTO> {
    const response = await axiosInstance.put<StructureTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete structure type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all structure type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<StructureTypeDTO>> {
    const response = await axiosInstance.get<Page<StructureTypeDTO>>(`${BASE_URL}/search`, {
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
