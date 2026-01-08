/**
 * Terminal Service - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.service.TerminalService
 * 
 * Provides CRUD operations and search functionality for terminals.
 * Terminals are endpoints where hydrocarbons are received or dispatched.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { TerminalDTO } from '../dto/TerminalDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/core/terminals';

export class TerminalService {
  /**
   * Get all terminals with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<TerminalDTO>> {
    const response = await axiosInstance.get<Page<TerminalDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all terminals without pagination
   */
  static async getAllNoPagination(): Promise<TerminalDTO[]> {
    const response = await axiosInstance.get<TerminalDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get terminal by ID
   */
  static async getById(id: number): Promise<TerminalDTO> {
    const response = await axiosInstance.get<TerminalDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new terminal
   * Validates that code doesn't already exist
   */
  static async create(dto: TerminalDTO): Promise<TerminalDTO> {
    const response = await axiosInstance.post<TerminalDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing terminal
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: TerminalDTO): Promise<TerminalDTO> {
    const response = await axiosInstance.put<TerminalDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete terminal by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all terminal fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<TerminalDTO>> {
    const response = await axiosInstance.get<Page<TerminalDTO>>(`${BASE_URL}/search`, {
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
