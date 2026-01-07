/**
 * Structure Service - General Organization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.organization.service.StructureService
 * 
 * Provides CRUD operations and search functionality for organizational structures.
 * Structures can form hierarchies (parent-child relationships) and have types.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { StructureDTO } from '../dto/StructureDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/general/organization/structures';

export class StructureService {
  /**
   * Get all structures with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<StructureDTO>> {
    const response = await apiClient.get<Page<StructureDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all structures without pagination
   */
  static async getAllNoPagination(): Promise<StructureDTO[]> {
    const response = await apiClient.get<StructureDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get structure by ID
   */
  static async getById(id: number): Promise<StructureDTO> {
    const response = await apiClient.get<StructureDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new structure
   * Backend logs: "Creating structure: code={code}, designationFr={designationFr}, structureTypeId={structureTypeId}"
   */
  static async create(dto: StructureDTO): Promise<StructureDTO> {
    const response = await apiClient.post<StructureDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing structure
   * Backend logs: "Updating structure with ID: {id}"
   */
  static async update(id: number, dto: StructureDTO): Promise<StructureDTO> {
    const response = await apiClient.put<StructureDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete structure by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all structure fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<StructureDTO>> {
    const response = await apiClient.get<Page<StructureDTO>>(`${BASE_URL}/search`, {
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
   * Get structures by structure type ID
   */
  static async getByStructureTypeId(structureTypeId: number): Promise<StructureDTO[]> {
    const response = await apiClient.get<StructureDTO[]>(`${BASE_URL}/by-type/${structureTypeId}`);
    return response.data;
  }

  /**
   * Get child structures by parent structure ID
   */
  static async getByParentStructureId(parentStructureId: number): Promise<StructureDTO[]> {
    const response = await apiClient.get<StructureDTO[]>(`${BASE_URL}/by-parent/${parentStructureId}`);
    return response.data;
  }

  /**
   * Get root structures (structures with no parent)
   */
  static async getRootStructures(): Promise<StructureDTO[]> {
    const response = await apiClient.get<StructureDTO[]>(`${BASE_URL}/roots`);
    return response.data;
  }
}
