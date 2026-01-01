/**
 * ArchiveBox Service
 * Matches: dz.mdn.iaas.common.environment.service.ArchiveBoxService.java
 * Communicates with: ArchiveBoxController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 */

import axiosInstance from '../../../../shared/config/axios';
import { ArchiveBoxDTO } from '../dto/ArchiveBoxDTO';
import { PageResponse } from '../../../../shared/types/PageResponse';

class ArchiveBoxService {
  private readonly BASE_URL = '/common/environment/archiveBox';

  async getAll(): Promise<ArchiveBoxDTO[]> {
    const response = await axiosInstance.get<ArchiveBoxDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<ArchiveBoxDTO>> {
    const response = await axiosInstance.get<PageResponse<ArchiveBoxDTO>>(this.BASE_URL, {
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
  ): Promise<PageResponse<ArchiveBoxDTO>> {
    const response = await axiosInstance.get<PageResponse<ArchiveBoxDTO>>(`${this.BASE_URL}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<ArchiveBoxDTO> {
    const response = await axiosInstance.get<ArchiveBoxDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async create(archiveBox: ArchiveBoxDTO): Promise<ArchiveBoxDTO> {
    const response = await axiosInstance.post<ArchiveBoxDTO>(this.BASE_URL, { ...archiveBox, id: null });
    return response.data;
  }

  async update(id: number, archiveBox: ArchiveBoxDTO): Promise<ArchiveBoxDTO> {
    const response = await axiosInstance.put<ArchiveBoxDTO>(`${this.BASE_URL}/${id}`, archiveBox);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }

  async getByShelf(shelfId: number): Promise<ArchiveBoxDTO[]> {
    const response = await axiosInstance.get<ArchiveBoxDTO[]>(`${this.BASE_URL}/shelf/${shelfId}`);
    return response.data;
  }

  async getByShelfFloor(shelfFloorId: number): Promise<ArchiveBoxDTO[]> {
    const response = await axiosInstance.get<ArchiveBoxDTO[]>(`${this.BASE_URL}/shelfFloor/${shelfFloorId}`);
    return response.data;
  }
}

export default new ArchiveBoxService();
