/**
 * Role Service
 * Matches: dz.mdn.iaas.system.security.service.RoleService.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { RoleDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

class RoleService {
  private readonly BASE_URL = '/system/security/role';

  /**
   * Get all roles
   */
  async getAll(): Promise<RoleDTO[]> {
    const response = await axiosInstance.get<RoleDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

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
   */
  async getById(id: number): Promise<RoleDTO> {
    const response = await axiosInstance.get<RoleDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new role
   */
  async create(role: Partial<RoleDTO>): Promise<RoleDTO> {
    const response = await axiosInstance.post<RoleDTO>(this.BASE_URL, { ...role, id: null });
    return response.data;
  }

  /**
   * Update existing role
   */
  async update(id: number, role: Partial<RoleDTO>): Promise<RoleDTO> {
    const response = await axiosInstance.put<RoleDTO>(`${this.BASE_URL}/${id}`, role);
    return response.data;
  }

  /**
   * Delete role
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new RoleService();
