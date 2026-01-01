/**
 * Shelf Service
 * Matches: dz.mdn.iaas.common.environment.service.ShelfService.java
 * Communicates with: ShelfController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { ShelfDTO } from '../dto/ShelfDTO';
import { PageResponse } from '../../../../shared/types/PageResponse';

class ShelfService {
  private readonly BASE_URL = '/common/environment/shelf';

  async getAll(): Promise<ShelfDTO[]> {
    const response = await axiosInstance.get<ShelfDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<ShelfDTO>> {
    const response = await axiosInstance.get<PageResponse<ShelfDTO>>(this.BASE_URL, {
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
  ): Promise<PageResponse<ShelfDTO>> {
    const response = await axiosInstance.get<PageResponse<ShelfDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<ShelfDTO> {
    const response = await axiosInstance.get<ShelfDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async create(shelf: ShelfDTO): Promise<ShelfDTO> {
    const response = await axiosInstance.post<ShelfDTO>(this.BASE_URL, { ...shelf, id: null });
    return response.data;
  }

  async update(id: number, shelf: ShelfDTO): Promise<ShelfDTO> {
    const response = await axiosInstance.put<ShelfDTO>(`${this.BASE_URL}/${id}`, shelf);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new ShelfService();
