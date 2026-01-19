/**
 * Permission Service
 * Handles API calls for Permission management
 * Matches backend: dz.sh.trc.hyflo.system.security.service.PermissionService
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Enhanced documentation and typing aligned with DTO changes
 * @created 12-22-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { PermissionDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

class PermissionService {
  private readonly BASE_URL = '/system/security/permission';

  /**
   * Get all permissions (non-paginated)
   * @returns Array of all permissions
   */
  async getAll(): Promise<PermissionDTO[]> {
    const response = await axiosInstance.get<PermissionDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get paginated permissions
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Field to sort by
   * @param sortDir Sort direction (asc/desc)
   * @returns Paginated response with permissions
   */
  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<PermissionDTO>> {
    const response = await axiosInstance.get<PageResponse<PermissionDTO>>(this.BASE_URL, {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  }

  /**
   * Search permissions
   * @param query Search query string
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Field to sort by
   * @param sortDir Sort direction (asc/desc)
   * @returns Paginated search results
   */
  async search(
    query: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<PermissionDTO>> {
    const response = await axiosInstance.get<PageResponse<PermissionDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  /**
   * Get permission by ID
   * @param id Permission ID
   * @returns Permission details
   */
  async getById(id: number): Promise<PermissionDTO> {
    const response = await axiosInstance.get<PermissionDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new permission
   * @param permission Permission data (without id)
   * @returns Created permission with generated id
   */
  async create(permission: Omit<PermissionDTO, 'id'>): Promise<PermissionDTO> {
    const response = await axiosInstance.post<PermissionDTO>(this.BASE_URL, { ...permission, id: null });
    return response.data;
  }

  /**
   * Update existing permission
   * @param id Permission ID to update
   * @param permission Partial permission data (can update name, description, resource, action)
   * @returns Updated permission
   */
  async update(id: number, permission: Partial<PermissionDTO>): Promise<PermissionDTO> {
    const response = await axiosInstance.put<PermissionDTO>(`${this.BASE_URL}/${id}`, permission);
    return response.data;
  }

  /**
   * Delete permission
   * @param id Permission ID to delete
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new PermissionService();