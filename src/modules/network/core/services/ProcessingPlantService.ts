/**
 * ProcessingPlant Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.ProcessingPlantService
 * Created: 01-15-2026 - New service for ProcessingPlantDTO
 * 
 * Provides CRUD operations and search functionality for processing plants.
 * Processing plants are facilities that process hydrocarbons (refineries, treatment plants, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import axiosInstance from '@/shared/config/axios';
import type { ProcessingPlantDTO } from '../dto/ProcessingPlantDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/processingPlant';

export class ProcessingPlantService {
  /**
   * Get all processing plants with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<ProcessingPlantDTO>> {
    const response = await axiosInstance.get<Page<ProcessingPlantDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all processing plants without pagination
   */
  static async getAllNoPagination(): Promise<ProcessingPlantDTO[]> {
    const response = await axiosInstance.get<ProcessingPlantDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get processing plant by ID
   */
  static async getById(id: number): Promise<ProcessingPlantDTO> {
    const response = await axiosInstance.get<ProcessingPlantDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new processing plant
   * Validates that code doesn't already exist
   */
  static async create(dto: ProcessingPlantDTO): Promise<ProcessingPlantDTO> {
    const response = await axiosInstance.post<ProcessingPlantDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing processing plant
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: ProcessingPlantDTO): Promise<ProcessingPlantDTO> {
    const response = await axiosInstance.put<ProcessingPlantDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete processing plant by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all processing plant fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<ProcessingPlantDTO>> {
    const response = await axiosInstance.get<Page<ProcessingPlantDTO>>(`${BASE_URL}/search`, {
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
   * Find processing plants by location
   * Returns all processing plants at a specific location
   */
  static async findByLocation(locationId: number): Promise<ProcessingPlantDTO[]> {
    const response = await axiosInstance.get<ProcessingPlantDTO[]>(
      `${BASE_URL}/by-location/${locationId}`
    );
    return response.data;
  }

  /**
   * Find processing plants by type
   * Returns all processing plants of a specific type
   */
  static async findByType(typeId: number): Promise<ProcessingPlantDTO[]> {
    const response = await axiosInstance.get<ProcessingPlantDTO[]>(
      `${BASE_URL}/by-type/${typeId}`
    );
    return response.data;
  }

  /**
   * Get pipelines connected to a processing plant
   * Returns pipeline IDs from the plant's pipelineIds collection
   */
  static async getPipelines(plantId: number): Promise<number[]> {
    const plant = await this.getById(plantId);
    return plant.pipelineIds || [];
  }

  /**
   * Get partners associated with a processing plant
   * Returns partner IDs from the plant's partnerIds collection
   */
  static async getPartners(plantId: number): Promise<number[]> {
    const plant = await this.getById(plantId);
    return plant.partnerIds || [];
  }

  /**
   * Get products processed at a processing plant
   * Returns product IDs from the plant's productIds collection
   */
  static async getProducts(plantId: number): Promise<number[]> {
    const plant = await this.getById(plantId);
    return plant.productIds || [];
  }

  /**
   * Find processing plants by operational status
   * Returns all processing plants with a specific operational status
   */
  static async findByOperationalStatus(statusId: number): Promise<ProcessingPlantDTO[]> {
    const response = await axiosInstance.get<ProcessingPlantDTO[]>(
      `${BASE_URL}/by-operational-status/${statusId}`
    );
    return response.data;
  }
}
