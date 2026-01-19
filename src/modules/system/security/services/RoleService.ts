/**
 * Role Service
 * Handles API calls for Role management (Roles contain Permissions)
 * Matches backend: dz.sh.trc.hyflo.system.security.service.RoleService
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Enhanced documentation and typing aligned with DTO changes
 * @updated 12-29-2025 - Set id=null in create
 * @created 12-22-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { RoleDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

class RoleService {
  private readonly BASE_URL = '/system/security/role';

  /**
   * Get all roles (non-paginated)
   * @returns Array of all roles with their permissions
   */
  async getAll(): Promise<RoleDTO[]> {
    const response = await axiosInstance.get<RoleDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get paginated roles
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Field to sort by
   * @param sortDir Sort direction (asc/desc)
   * @returns Paginated response with roles
   */
  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<RoleDTO>> {
    const response = await axiosInstance.get<PageResponse<RoleDTO>>(this.BASE_URL, {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  }

  /**
   * Search roles
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
  ): Promise<PageResponse<RoleDTO>> {
    const response = await axiosInstance.get<PageResponse<RoleDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  /**
   * Get role by ID
   * @param id Role ID
   * @returns Role with its permissions
   */
  async getById(id: number): Promise<RoleDTO> {
    const response = await axiosInstance.get<RoleDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new role
   * @param role Role data (without id, can include permissions)
   * @returns Created role with generated id
   */
  async create(role: Omit<RoleDTO, 'id'>): Promise<RoleDTO> {
    const response = await axiosInstance.post<RoleDTO>(this.BASE_URL, { ...role, id: null });
    return response.data;
  }

  /**
   * Update existing role
   * @param id Role ID to update
   * @param role Partial role data (can update name, description, permissions)
   * @returns Updated role
   */
  async update(id: number, role: Partial<RoleDTO>): Promise<RoleDTO> {
    const response = await axiosInstance.put<RoleDTO>(`${this.BASE_URL}/${id}`, role);
    return response.data;
  }

  /**
   * Delete role
   * @param id Role ID to delete
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new RoleService();