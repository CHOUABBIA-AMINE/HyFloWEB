/**
 * ProductionField Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.ProductionFieldService
 * Created: 01-15-2026 - New service for ProductionFieldDTO
 * 
 * Provides CRUD operations and search functionality for production fields.
 * Production fields are hydrocarbon extraction sites (oil fields, gas fields, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import axiosInstance from '@/shared/config/axios';
import type { ProductionFieldDTO } from '../dto/ProductionFieldDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/productionField';

export class ProductionFieldService {
  /**
   * Get all production fields with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<ProductionFieldDTO>> {
    const response = await axiosInstance.get<Page<ProductionFieldDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all production fields without pagination
   */
  static async getAllNoPagination(): Promise<ProductionFieldDTO[]> {
    const response = await axiosInstance.get<ProductionFieldDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get production field by ID
   */
  static async getById(id: number): Promise<ProductionFieldDTO> {
    const response = await axiosInstance.get<ProductionFieldDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new production field
   * Validates that code doesn't already exist
   */
  static async create(dto: ProductionFieldDTO): Promise<ProductionFieldDTO> {
    const response = await axiosInstance.post<ProductionFieldDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing production field
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: ProductionFieldDTO): Promise<ProductionFieldDTO> {
    const response = await axiosInstance.put<ProductionFieldDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete production field by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all production field fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<ProductionFieldDTO>> {
    const response = await axiosInstance.get<Page<ProductionFieldDTO>>(`${BASE_URL}/search`, {
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
   * Find production fields by location
   * Returns all production fields at a specific location
   */
  static async findByLocation(locationId: number): Promise<ProductionFieldDTO[]> {
    const response = await axiosInstance.get<ProductionFieldDTO[]>(
      `${BASE_URL}/location/${locationId}`
    );
    return response.data;
  }

  /**
   * Find production fields by type
   * Returns all production fields of a specific type
   */
  static async findByType(typeId: number): Promise<ProductionFieldDTO[]> {
    const response = await axiosInstance.get<ProductionFieldDTO[]>(
      `${BASE_URL}/type/${typeId}`
    );
    return response.data;
  }

  /**
   * Find production fields by processing plant
   * Returns all production fields connected to a specific processing plant
   */
  static async findByProcessingPlant(plantId: number): Promise<ProductionFieldDTO[]> {
    const response = await axiosInstance.get<ProductionFieldDTO[]>(
      `${BASE_URL}/plant/${plantId}`
    );
    return response.data;
  }

  /**
   * Get partners associated with a production field
   * Returns partner IDs from the field's partnerIds collection
   */
  static async getPartners(fieldId: number): Promise<number[]> {
    const field = await this.getById(fieldId);
    return field.partnerIds || [];
  }

  /**
   * Get products extracted from a production field
   * Returns product IDs from the field's productIds collection
   */
  static async getProducts(fieldId: number): Promise<number[]> {
    const field = await this.getById(fieldId);
    return field.productIds || [];
  }

  /**
   * Find production fields by operational status
   * Returns all production fields with a specific operational status
   */
  static async findByOperationalStatus(statusId: number): Promise<ProductionFieldDTO[]> {
    const response = await axiosInstance.get<ProductionFieldDTO[]>(
      `${BASE_URL}/status/${statusId}`
    );
    return response.data;
  }
}
