/**
 * User Service
 * Service for managing user data and operations
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 01-20-2026 - Aligned with new UserDTO structure
 */

import axiosInstance from '../../../../shared/config/axios'
import { UserDTO } from '../dto'

class UserService {
  private readonly BASE_URL = '/user'

  async getAll(): Promise<UserDTO[]> {
    const response = await axiosInstance.get<UserDTO[]>(this.BASE_URL)
    return response.data
  }

  async getById(id: number): Promise<UserDTO> {
    const response = await axiosInstance.get<UserDTO>(`${this.BASE_URL}/${id}`)
    return response.data
  }

  async create(user: UserDTO): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>(this.BASE_URL, user)
    return response.data
  }

  async update(id: number, user: UserDTO): Promise<UserDTO> {
    const response = await axiosInstance.put<UserDTO>(`${this.BASE_URL}/${id}`, user)
    return response.data
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`)
  }

  async assignRole(userId: number, roleId: number): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>(
      `${this.BASE_URL}/${userId}/roles/${roleId}`
    )
    return response.data
  }

  async removeRole(userId: number, roleId: number): Promise<UserDTO> {
    const response = await axiosInstance.delete<UserDTO>(
      `${this.BASE_URL}/${userId}/roles/${roleId}`
    )
    return response.data
  }

  async assignGroup(userId: number, groupId: number): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>(
      `${this.BASE_URL}/${userId}/groups/${groupId}`
    )
    return response.data
  }

  async removeGroup(userId: number, groupId: number): Promise<UserDTO> {
    const response = await axiosInstance.delete<UserDTO>(
      `${this.BASE_URL}/${userId}/groups/${groupId}`
    )
    return response.data
  }

  async linkEmployee(userId: number, employeeId: number): Promise<UserDTO> {
    const response = await axiosInstance.put<UserDTO>(
      `${this.BASE_URL}/${userId}/employee/${employeeId}`
    )
    return response.data
  }

  async unlinkEmployee(userId: number): Promise<UserDTO> {
    const response = await axiosInstance.delete<UserDTO>(
      `${this.BASE_URL}/${userId}/employee`
    )
    return response.data
  }
}

export default new UserService()
