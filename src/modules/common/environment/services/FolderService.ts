/**
 * Folder Service
 * Matches: dz.mdn.iaas.common.environment.service.FolderService.java
 * Communicates with: FolderController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { FolderDTO } from '../dto/FolderDTO';
import { PageResponse } from '../../../../shared/types/PageResponse';

class FolderService {
  private readonly BASE_URL = '/common/environment/folder';

  async getAll(): Promise<FolderDTO[]> {
    const response = await axiosInstance.get<FolderDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<FolderDTO>> {
    const response = await axiosInstance.get<PageResponse<FolderDTO>>(this.BASE_URL, {
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
  ): Promise<PageResponse<FolderDTO>> {
    const response = await axiosInstance.get<PageResponse<FolderDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<FolderDTO> {
    const response = await axiosInstance.get<FolderDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async create(folder: FolderDTO): Promise<FolderDTO> {
    const response = await axiosInstance.post<FolderDTO>(this.BASE_URL, { ...folder, id: null });
    return response.data;
  }

  async update(id: number, folder: FolderDTO): Promise<FolderDTO> {
    const response = await axiosInstance.put<FolderDTO>(`${this.BASE_URL}/${id}`, folder);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new FolderService();
