/**
 * Zone Service - General Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.service.ZoneService
 * 
 * Provides CRUD operations and search functionality for zones/regions.
 * Zones represent geographic or administrative regions.
 * 
 * Special validations:
 * - designationFr must be unique
 * - code must be unique
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { ZoneDTO } from '../dto/ZoneDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/localization/zones';

export class ZoneService {
  /**
   * Get all zones with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<ZoneDTO>> {
    const response = await axiosInstance.get<Page<ZoneDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all zones without pagination
   */
  static async getAllNoPagination(): Promise<ZoneDTO[]> {
    const response = await axiosInstance.get<ZoneDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get zone by ID
   */
  static async getById(id: number): Promise<ZoneDTO> {
    const response = await axiosInstance.get<ZoneDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new zone
   * Backend logs: "Creating zone: designationFr={designationFr}"
   * 
   * Validations:
   * - Checks if designationFr already exists
   * - Checks if code already exists
   * - Throws BusinessValidationException if duplicates found
   */
  static async create(dto: ZoneDTO): Promise<ZoneDTO> {
    const response = await axiosInstance.post<ZoneDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing zone
   * Backend logs: "Updating zone with ID: {id}"
   * 
   * Validations:
   * - Checks if designationFr already exists (for other zones)
   * - Checks if code already exists (for other zones)
   * - Throws BusinessValidationException if duplicates found
   */
  static async update(id: number, dto: ZoneDTO): Promise<ZoneDTO> {
    const response = await axiosInstance.put<ZoneDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete zone by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all zone fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<ZoneDTO>> {
    const response = await axiosInstance.get<Page<ZoneDTO>>(`${BASE_URL}/search`, {
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
