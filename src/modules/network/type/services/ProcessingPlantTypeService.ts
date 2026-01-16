/**
 * ProcessingPlantType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.ProcessingPlantTypeService
 * 
 * Provides CRUD operations and search functionality for processing plant types.
 * Processing plant types categorize hydrocarbon processing facilities.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-15-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { ProcessingPlantTypeDTO } from '../dto/ProcessingPlantTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/processingPlant';

export class ProcessingPlantTypeService {
  /**
   * Get all processing plant types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<ProcessingPlantTypeDTO>> {
    const response = await axiosInstance.get<Page<ProcessingPlantTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all processing plant types without pagination
   */
  static async getAllNoPagination(): Promise<ProcessingPlantTypeDTO[]> {
    const response = await axiosInstance.get<ProcessingPlantTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get processing plant type by ID
   */
  static async getById(id: number): Promise<ProcessingPlantTypeDTO> {
    const response = await axiosInstance.get<ProcessingPlantTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new processing plant type
   */
  static async create(dto: ProcessingPlantTypeDTO): Promise<ProcessingPlantTypeDTO> {
    const response = await axiosInstance.post<ProcessingPlantTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing processing plant type
   */
  static async update(id: number, dto: ProcessingPlantTypeDTO): Promise<ProcessingPlantTypeDTO> {
    const response = await axiosInstance.put<ProcessingPlantTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete processing plant type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all processing plant type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<ProcessingPlantTypeDTO>> {
    const response = await axiosInstance.get<Page<ProcessingPlantTypeDTO>>(`${BASE_URL}/search`, {
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
