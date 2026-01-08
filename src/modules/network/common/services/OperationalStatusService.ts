/**
 * OperationalStatus Service - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.service.OperationalStatusService
 * 
 * Provides CRUD operations and search functionality for operational statuses.
 * Operational statuses represent the current state of network infrastructure (Active, Inactive, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { OperationalStatusDTO } from '../dto/OperationalStatusDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/common/operational-statuses';

export class OperationalStatusService {
  /**
   * Get all operational statuses with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<OperationalStatusDTO>> {
    const response = await axiosInstance.get<Page<OperationalStatusDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all operational statuses without pagination
   */
  static async getAllNoPagination(): Promise<OperationalStatusDTO[]> {
    const response = await axiosInstance.get<OperationalStatusDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get operational status by ID
   */
  static async getById(id: number): Promise<OperationalStatusDTO> {
    const response = await axiosInstance.get<OperationalStatusDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new operational status
   * Validates that code and designationFr don't already exist
   */
  static async create(dto: OperationalStatusDTO): Promise<OperationalStatusDTO> {
    const response = await axiosInstance.post<OperationalStatusDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing operational status
   * Validates that code and designationFr don't exist for other records
   */
  static async update(id: number, dto: OperationalStatusDTO): Promise<OperationalStatusDTO> {
    const response = await axiosInstance.put<OperationalStatusDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete operational status by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all operational status fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<OperationalStatusDTO>> {
    const response = await axiosInstance.get<Page<OperationalStatusDTO>>(`${BASE_URL}/search`, {
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
