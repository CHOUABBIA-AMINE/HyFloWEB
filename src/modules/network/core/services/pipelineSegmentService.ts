/**
 * PipelineSegment Service
 * Mirrors backend controller: /network/core/pipelineSegment
 */

import axios from '../../../../shared/config/axios';
import { PipelineSegmentDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/pipelineSegment';

class PipelineSegmentService {
  async getAll(): Promise<PipelineSegmentDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<PipelineSegmentDTO>> {
    const response = await axios.get<PageResponse<PipelineSegmentDTO>>(API_BASE, {
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
  ): Promise<PageResponse<PipelineSegmentDTO>> {
    const response = await axios.get<PageResponse<PipelineSegmentDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<PipelineSegmentDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: PipelineSegmentDTO): Promise<PipelineSegmentDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: PipelineSegmentDTO): Promise<PipelineSegmentDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }

  async getByPipeline(pipelineId: number): Promise<PipelineSegmentDTO[]> {
    const response = await axios.get(`${API_BASE}/pipeline/${pipelineId}`);
    return response.data;
  }
}

export const pipelineSegmentService = new PipelineSegmentService();
