/**
 * Pipeline Service
 * Mirrors backend controller: /network/core/pipeline
 */

import axios from '../../../../shared/config/axios';
import { PipelineDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/pipeline';

class PipelineService {
  async getAll(): Promise<PipelineDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<PipelineDTO>> {
    const response = await axios.get<PageResponse<PipelineDTO>>(API_BASE, {
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
  ): Promise<PageResponse<PipelineDTO>> {
    const response = await axios.get<PageResponse<PipelineDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<PipelineDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: PipelineDTO): Promise<PipelineDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: PipelineDTO): Promise<PipelineDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }

  async getBySystem(systemId: number): Promise<PipelineDTO[]> {
    const response = await axios.get(`${API_BASE}/system/${systemId}`);
    return response.data;
  }
}

export const pipelineService = new PipelineService();
