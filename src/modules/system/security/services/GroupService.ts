/**
 * Group Service
 * Handles API calls for Group management (Groups contain Roles)
 * Matches backend: dz.sh.trc.hyflo.system.security.service.GroupService
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Enhanced documentation and typing aligned with DTO changes
 * @updated 12-29-2025 - Set id=null in create
 * @created 12-22-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { GroupDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

class GroupService {
  private readonly BASE_URL = '/system/security/group';

  /**
   * Get all groups (non-paginated)
   * @returns Array of all groups with their roles
   */
  async getAll(): Promise<GroupDTO[]> {
    const response = await axiosInstance.get<GroupDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get paginated groups
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Field to sort by
   * @param sortDir Sort direction (asc/desc)
   * @returns Paginated response with groups
   */
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

  /**
   * Search groups
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
  ): Promise<PageResponse<GroupDTO>> {
    const response = await axiosInstance.get<PageResponse<GroupDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  /**
   * Get group by ID
   * @param id Group ID
   * @returns Group with its roles
   */
  async getById(id: number): Promise<GroupDTO> {
    const response = await axiosInstance.get<GroupDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new group
   * @param group Group data (without id, can include roles)
   * @returns Created group with generated id
   */
  async create(group: Omit<GroupDTO, 'id'>): Promise<GroupDTO> {
    const response = await axiosInstance.post<GroupDTO>(this.BASE_URL, { ...group, id: null });
    return response.data;
  }

  /**
   * Update existing group
   * @param id Group ID to update
   * @param group Partial group data (can update name, description, roles)
   * @returns Updated group
   */
  async update(id: number, group: Partial<GroupDTO>): Promise<GroupDTO> {
    const response = await axiosInstance.put<GroupDTO>(`${this.BASE_URL}/${id}`, group);
    return response.data;
  }

  /**
   * Delete group
   * @param id Group ID to delete
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new GroupService();