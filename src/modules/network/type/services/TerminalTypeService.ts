/**
 * TerminalType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.TerminalTypeService
 * 
 * Provides CRUD operations and search functionality for terminal types.
 * Terminal types categorize endpoints (LNG Terminal, Export Terminal, Import Terminal, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { TerminalTypeDTO } from '../dto/TerminalTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/network/type/terminal-types';

export class TerminalTypeService {
  /**
   * Get all terminal types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<TerminalTypeDTO>> {
    const response = await apiClient.get<Page<TerminalTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get terminal type by ID
   */
  static async getById(id: number): Promise<TerminalTypeDTO> {
    const response = await apiClient.get<TerminalTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new terminal type
   */
  static async create(dto: TerminalTypeDTO): Promise<TerminalTypeDTO> {
    const response = await apiClient.post<TerminalTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing terminal type
   */
  static async update(id: number, dto: TerminalTypeDTO): Promise<TerminalTypeDTO> {
    const response = await apiClient.put<TerminalTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete terminal type by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all terminal type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<TerminalTypeDTO>> {
    const response = await apiClient.get<Page<TerminalTypeDTO>>(`${BASE_URL}/search`, {
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
