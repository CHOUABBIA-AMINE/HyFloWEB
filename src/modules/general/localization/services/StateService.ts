/**
 * State Service - General Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.service.StateService
 * 
 * Provides CRUD operations and search functionality for states/provinces.
 * States belong to countries in the geographic hierarchy.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { StateDTO } from '../dto/StateDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/localization/state';

export class StateService {
  /**
   * Get all states with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<StateDTO>> {
    const response = await axiosInstance.get<Page<StateDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all states without pagination
   */
  static async getAllNoPagination(): Promise<StateDTO[]> {
    const response = await axiosInstance.get<StateDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get state by ID
   */
  static async getById(id: number): Promise<StateDTO> {
    const response = await axiosInstance.get<StateDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new state
   * Backend logs: "Creating state: code={code}, designationFr={designationFr}"
   */
  static async create(dto: StateDTO): Promise<StateDTO> {
    const response = await axiosInstance.post<StateDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing state
   * Backend logs: "Updating state with ID: {id}"
   */
  static async update(id: number, dto: StateDTO): Promise<StateDTO> {
    const response = await axiosInstance.put<StateDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete state by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all state fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<StateDTO>> {
    const response = await axiosInstance.get<Page<StateDTO>>(`${BASE_URL}/search`, {
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
