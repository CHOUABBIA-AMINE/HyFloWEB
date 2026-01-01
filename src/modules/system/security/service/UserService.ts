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
}

export default new UserService()
