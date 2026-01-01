/**
 * Floor Service
 * Matches: dz.mdn.iaas.common.environment.service.FloorService.java
 * Communicates with: FloorController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { FloorDTO } from '../dto/FloorDTO';

class FloorService {
  private readonly BASE_URL = '/common/environment/floor';

  async getAll(): Promise<FloorDTO[]> {
    const response = await axiosInstance.get<FloorDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getById(id: number): Promise<FloorDTO> {
    const response = await axiosInstance.get<FloorDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async create(floor: FloorDTO): Promise<FloorDTO> {
    const response = await axiosInstance.post<FloorDTO>(this.BASE_URL, floor);
    return response.data;
  }

  async update(id: number, floor: FloorDTO): Promise<FloorDTO> {
    const response = await axiosInstance.put<FloorDTO>(`${this.BASE_URL}/${id}`, floor);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new FloorService();
