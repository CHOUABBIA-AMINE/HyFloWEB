import axiosInstance from '../../../../shared/config/axios'
import { RoleDTO } from '../dto'

class RoleService {
  private readonly BASE_URL = '/role'

  async getAll(): Promise<RoleDTO[]> {
    const response = await axiosInstance.get<RoleDTO[]>(this.BASE_URL)
    return response.data
  }

  async getById(id: number): Promise<RoleDTO> {
    const response = await axiosInstance.get<RoleDTO>(`${this.BASE_URL}/${id}`)
    return response.data
  }

  async create(role: RoleDTO): Promise<RoleDTO> {
    const response = await axiosInstance.post<RoleDTO>(this.BASE_URL, role)
    return response.data
  }

  async update(id: number, role: RoleDTO): Promise<RoleDTO> {
    const response = await axiosInstance.put<RoleDTO>(`${this.BASE_URL}/${id}`, role)
    return response.data
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`)
  }
}

export default new RoleService()
