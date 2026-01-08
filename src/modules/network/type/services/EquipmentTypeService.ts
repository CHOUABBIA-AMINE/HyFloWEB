/**
 * EquipmentType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.EquipmentTypeService
 * 
 * Provides CRUD operations and search functionality for equipment types.
 * Equipment types categorize machinery and devices (Pump, Compressor, Valve, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { EquipmentTypeDTO } from '../dto/EquipmentTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/equipment-types';

export class EquipmentTypeService {
  /**
   * Get all equipment types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<EquipmentTypeDTO>> {
    const response = await axiosInstance.get<Page<EquipmentTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all equipment types without pagination
   */
  static async getAllNoPagination(): Promise<EquipmentTypeDTO[]> {
    const response = await axiosInstance.get<EquipmentTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get equipment type by ID
   */
  static async getById(id: number): Promise<EquipmentTypeDTO> {
    const response = await axiosInstance.get<EquipmentTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new equipment type
   * Validates that code and designationFr don't already exist
   */
  static async create(dto: EquipmentTypeDTO): Promise<EquipmentTypeDTO> {
    const response = await axiosInstance.post<EquipmentTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing equipment type
   * Validates that code and designationFr don't exist for other records
   */
  static async update(id: number, dto: EquipmentTypeDTO): Promise<EquipmentTypeDTO> {
    const response = await axiosInstance.put<EquipmentTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete equipment type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all equipment type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<EquipmentTypeDTO>> {
    const response = await axiosInstance.get<Page<EquipmentTypeDTO>>(`${BASE_URL}/search`, {
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
