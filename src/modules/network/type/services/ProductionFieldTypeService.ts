/**
 * ProductionFieldType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.ProductionFieldTypeService
 * 
 * Provides CRUD operations and search functionality for production field types.
 * Production field types categorize hydrocarbon extraction sites.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-15-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { ProductionFieldTypeDTO } from '../dto/ProductionFieldTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/productionField';

export class ProductionFieldTypeService {
  /**
   * Get all production field types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<ProductionFieldTypeDTO>> {
    const response = await axiosInstance.get<Page<ProductionFieldTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all production field types without pagination
   */
  static async getAllNoPagination(): Promise<ProductionFieldTypeDTO[]> {
    const response = await axiosInstance.get<ProductionFieldTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get production field type by ID
   */
  static async getById(id: number): Promise<ProductionFieldTypeDTO> {
    const response = await axiosInstance.get<ProductionFieldTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new production field type
   */
  static async create(dto: ProductionFieldTypeDTO): Promise<ProductionFieldTypeDTO> {
    const response = await axiosInstance.post<ProductionFieldTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing production field type
   */
  static async update(id: number, dto: ProductionFieldTypeDTO): Promise<ProductionFieldTypeDTO> {
    const response = await axiosInstance.put<ProductionFieldTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete production field type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all production field type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<ProductionFieldTypeDTO>> {
    const response = await axiosInstance.get<Page<ProductionFieldTypeDTO>>(`${BASE_URL}/search`, {
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
