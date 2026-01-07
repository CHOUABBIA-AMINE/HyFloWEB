/**
 * Equipment Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.EquipmentService
 * 
 * Provides CRUD operations and search functionality for equipment.
 * Equipment represents machinery and devices installed at facilities.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { EquipmentDTO } from '../dto/EquipmentDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/network/core/equipment';

export class EquipmentService {
  /**
   * Get all equipment with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<EquipmentDTO>> {
    const response = await apiClient.get<Page<EquipmentDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all equipment without pagination
   */
  static async getAllNoPagination(): Promise<EquipmentDTO[]> {
    const response = await apiClient.get<EquipmentDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get equipment by ID
   */
  static async getById(id: number): Promise<EquipmentDTO> {
    const response = await apiClient.get<EquipmentDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new equipment
   * Validates that code and serialNumber don't already exist
   */
  static async create(dto: EquipmentDTO): Promise<EquipmentDTO> {
    const response = await apiClient.post<EquipmentDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing equipment
   * Validates that code and serialNumber don't exist for other records
   */
  static async update(id: number, dto: EquipmentDTO): Promise<EquipmentDTO> {
    const response = await apiClient.put<EquipmentDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete equipment by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all equipment fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<EquipmentDTO>> {
    const response = await apiClient.get<Page<EquipmentDTO>>(`${BASE_URL}/search`, {
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
   * Find equipment by facility
   */
  static async findByFacility(facilityId: number): Promise<EquipmentDTO[]> {
    const response = await apiClient.get<EquipmentDTO[]>(
      `${BASE_URL}/by-facility/${facilityId}`
    );
    return response.data;
  }

  /**
   * Find equipment by equipment type
   */
  static async findByEquipmentType(typeId: number): Promise<EquipmentDTO[]> {
    const response = await apiClient.get<EquipmentDTO[]>(
      `${BASE_URL}/by-equipment-type/${typeId}`
    );
    return response.data;
  }
}
