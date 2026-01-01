import axiosInstance from '../../../../shared/config/axios'
import { PermissionDTO } from '../dto'

class PermissionService {
  private readonly BASE_URL = '/permission'

  async getAll(): Promise<PermissionDTO[]> {
    const response = await axiosInstance.get<PermissionDTO[]>(this.BASE_URL)
    return response.data
  }

  async getById(id: number): Promise<PermissionDTO> {
    const response = await axiosInstance.get<PermissionDTO>(`${this.BASE_URL}/${id}`)
    return response.data
  }

  async create(permission: PermissionDTO): Promise<PermissionDTO> {
    const response = await axiosInstance.post<PermissionDTO>(this.BASE_URL, permission)
    return response.data
  }

  async update(id: number, permission: PermissionDTO): Promise<PermissionDTO> {
    const response = await axiosInstance.put<PermissionDTO>(`${this.BASE_URL}/${id}`, permission)
    return response.data
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`)
  }
}

export default new PermissionService()
