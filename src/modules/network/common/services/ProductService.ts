/**
 * Product Service - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.service.ProductService
 * 
 * Provides CRUD operations and search functionality for products.
 * Products represent the types of hydrocarbons transported (Natural Gas, Oil, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { ProductDTO } from '../dto/ProductDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/common/products';

export class ProductService {
  /**
   * Get all products with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<ProductDTO>> {
    const response = await axiosInstance.get<Page<ProductDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all products without pagination
   */
  static async getAllNoPagination(): Promise<ProductDTO[]> {
    const response = await axiosInstance.get<ProductDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get product by ID
   */
  static async getById(id: number): Promise<ProductDTO> {
    const response = await axiosInstance.get<ProductDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new product
   * Validates that code doesn't already exist
   */
  static async create(dto: ProductDTO): Promise<ProductDTO> {
    const response = await axiosInstance.post<ProductDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing product
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: ProductDTO): Promise<ProductDTO> {
    const response = await axiosInstance.put<ProductDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete product by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all product fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<ProductDTO>> {
    const response = await axiosInstance.get<Page<ProductDTO>>(`${BASE_URL}/search`, {
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
