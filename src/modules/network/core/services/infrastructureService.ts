/**
 * Infrastructure Service
 * Mirrors backend controller: /network/core/infrastructure
 */

import axios from '../../../../shared/config/axios';
import { InfrastructureDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/infrastructure';

class InfrastructureService {
  async getAll(): Promise<InfrastructureDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<InfrastructureDTO>> {
    const response = await axios.get<PageResponse<InfrastructureDTO>>(API_BASE, {
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
  ): Promise<PageResponse<InfrastructureDTO>> {
    const response = await axios.get<PageResponse<InfrastructureDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<InfrastructureDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: InfrastructureDTO): Promise<InfrastructureDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: InfrastructureDTO): Promise<InfrastructureDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }

  async getByRegion(regionId: number): Promise<InfrastructureDTO[]> {
    const response = await axios.get(`${API_BASE}/region/${regionId}`);
    return response.data;
  }
}

export const infrastructureService = new InfrastructureService();
