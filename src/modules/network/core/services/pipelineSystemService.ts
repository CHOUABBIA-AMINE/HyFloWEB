/**
 * PipelineSystem Service
 * Mirrors backend controller: /network/core/pipelineSystem
 */

import axios from '../../../../shared/config/axios';
import { PipelineSystemDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/pipelineSystem';

class PipelineSystemService {
  async getAll(): Promise<PipelineSystemDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<PipelineSystemDTO>> {
    const response = await axios.get<PageResponse<PipelineSystemDTO>>(API_BASE, {
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
  ): Promise<PageResponse<PipelineSystemDTO>> {
    const response = await axios.get<PageResponse<PipelineSystemDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<PipelineSystemDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: PipelineSystemDTO): Promise<PipelineSystemDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: PipelineSystemDTO): Promise<PipelineSystemDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }

  async getByProduct(productId: number): Promise<PipelineSystemDTO[]> {
    const response = await axios.get(`${API_BASE}/product/${productId}`);
    return response.data;
  }

  async getByOperationalStatus(operationalStatusId: number): Promise<PipelineSystemDTO[]> {
    const response = await axios.get(`${API_BASE}/status/${operationalStatusId}`);
    return response.data;
  }

  async getByRegion(regionId: number): Promise<PipelineSystemDTO[]> {
    const response = await axios.get(`${API_BASE}/region/${regionId}`);
    return response.data;
  }
}

export const pipelineSystemService = new PipelineSystemService();
