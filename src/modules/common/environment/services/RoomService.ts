/**
 * Room Service
 * Matches: dz.mdn.iaas.common.environment.service.RoomService.java
 * Communicates with: RoomController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { RoomDTO } from '../dto/RoomDTO';
import { PageResponse } from '../../../../shared/types/PageResponse';

class RoomService {
  private readonly BASE_URL = '/common/environment/room';

  async getAll(): Promise<RoomDTO[]> {
    const response = await axiosInstance.get<RoomDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<RoomDTO>> {
    const response = await axiosInstance.get<PageResponse<RoomDTO>>(this.BASE_URL, {
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
  ): Promise<PageResponse<RoomDTO>> {
    const response = await axiosInstance.get<PageResponse<RoomDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<RoomDTO> {
    const response = await axiosInstance.get<RoomDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async create(room: RoomDTO): Promise<RoomDTO> {
    const response = await axiosInstance.post<RoomDTO>(this.BASE_URL, { ...room, id: null });
    return response.data;
  }

  async update(id: number, room: RoomDTO): Promise<RoomDTO> {
    const response = await axiosInstance.put<RoomDTO>(`${this.BASE_URL}/${id}`, room);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }

  async getByFloor(floorId: number): Promise<RoomDTO[]> {
    const response = await axiosInstance.get<RoomDTO[]>(`${this.BASE_URL}/floor/${floorId}`);
    return response.data;
  }
}

export default new RoomService();
