/**
 * Structure Service
 * Handles API calls for organizational Structure CRUD operations
 * Matches: dz.mdn.iaas.system.organization.service.StructureService.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-29-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { StructureDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

class StructureService {
  private readonly BASE_URL = '/system/organization/structure';

  async getAll(): Promise<StructureDTO[]> {
    const response = await axiosInstance.get<StructureDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<StructureDTO>> {
    const response = await axiosInstance.get<PageResponse<StructureDTO>>(this.BASE_URL, {
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
  ): Promise<PageResponse<StructureDTO>> {
    const response = await axiosInstance.get<PageResponse<StructureDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<StructureDTO> {
    const response = await axiosInstance.get<StructureDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async create(structure: Partial<StructureDTO>): Promise<StructureDTO> {
    const response = await axiosInstance.post<StructureDTO>(this.BASE_URL, { ...structure, id: null });
    return response.data;
  }

  async update(id: number, structure: Partial<StructureDTO>): Promise<StructureDTO> {
    const response = await axiosInstance.put<StructureDTO>(`${this.BASE_URL}/${id}`, structure);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new StructureService();
