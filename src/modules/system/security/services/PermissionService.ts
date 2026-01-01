/**
 * Permission Service
 * Matches: dz.mdn.iaas.system.security.service.PermissionService.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { PermissionDTO } from '../dto';

class PermissionService {
  private readonly BASE_URL = '/system/security/permission';

  /**
   * Get all permissions
   */
  async getAll(): Promise<PermissionDTO[]> {
    const response = await axiosInstance.get<PermissionDTO[]>(this.BASE_URL);
    return response.data;
  }

  /**
   * Get permission by ID
   */
  async getById(id: number): Promise<PermissionDTO> {
    const response = await axiosInstance.get<PermissionDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new permission
   */
  async create(permission: Partial<PermissionDTO>): Promise<PermissionDTO> {
    const response = await axiosInstance.post<PermissionDTO>(this.BASE_URL, permission);
    return response.data;
  }

  /**
   * Update existing permission
   */
  async update(id: number, permission: Partial<PermissionDTO>): Promise<PermissionDTO> {
    const response = await axiosInstance.put<PermissionDTO>(`${this.BASE_URL}/${id}`, permission);
    return response.data;
  }

  /**
   * Delete permission
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new PermissionService();
