/**
 * User Service
 * Matches: dz.mdn.iaas.system.security.service.UserService.java
 * Communicates with: UserController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { UserDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

class UserService {
  private readonly BASE_URL = '/system/security/user';

  async getAll(): Promise<UserDTO[]> {
    const response = await axiosInstance.get<UserDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<UserDTO>> {
    const response = await axiosInstance.get<PageResponse<UserDTO>>(this.BASE_URL, {
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
  ): Promise<PageResponse<UserDTO>> {
    const response = await axiosInstance.get<PageResponse<UserDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<UserDTO> {
    const response = await axiosInstance.get<UserDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get user by username
   * Endpoint: GET /system/security/user/username/{username}
   */
  async getByUsername(username: string): Promise<UserDTO> {
    const response = await axiosInstance.get<UserDTO>(`${this.BASE_URL}/username/${username}`);
    return response.data;
  }

  async create(user: UserDTO): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>(this.BASE_URL, { ...user, id: null });
    return response.data;
  }

  async update(id: number, user: UserDTO): Promise<UserDTO> {
    const response = await axiosInstance.put<UserDTO>(`${this.BASE_URL}/${id}`, user);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }

  async assignRole(userId: number, roleId: number): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>(
      `${this.BASE_URL}/${userId}/roles/${roleId}`
    );
    return response.data;
  }

  async resetPassword(username: string, newPassword: string): Promise<void> {
    await axiosInstance.post(`${this.BASE_URL}/reset-password`, {
      username,
      newPassword,
    });
  }
}

export default new UserService();
