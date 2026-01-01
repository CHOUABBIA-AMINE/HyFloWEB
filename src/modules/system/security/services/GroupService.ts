/**
 * Group Service
 * Matches: dz.mdn.iaas.system.security.service.GroupService.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { GroupDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

class GroupService {
  private readonly BASE_URL = '/system/security/group';

  /**
   * Get all groups
   */
  async getAll(): Promise<GroupDTO[]> {
    const response = await axiosInstance.get<GroupDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<GroupDTO>> {
    const response = await axiosInstance.get<PageResponse<GroupDTO>>(this.BASE_URL, {
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
  ): Promise<PageResponse<GroupDTO>> {
    const response = await axiosInstance.get<PageResponse<GroupDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  /**
   * Get group by ID
   */
  async getById(id: number): Promise<GroupDTO> {
    const response = await axiosInstance.get<GroupDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new group
   */
  async create(group: Partial<GroupDTO>): Promise<GroupDTO> {
    const response = await axiosInstance.post<GroupDTO>(this.BASE_URL, { ...group, id: null });
    return response.data;
  }

  /**
   * Update existing group
   */
  async update(id: number, group: Partial<GroupDTO>): Promise<GroupDTO> {
    const response = await axiosInstance.put<GroupDTO>(`${this.BASE_URL}/${id}`, group);
    return response.data;
  }

  /**
   * Delete group
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new GroupService();
