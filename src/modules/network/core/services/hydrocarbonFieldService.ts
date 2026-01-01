/**
 * HydrocarbonField Service
 * Mirrors backend controller: /network/core/hydrocarbonField
 */

import axios from '../../../../shared/config/axios';
import { HydrocarbonFieldDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/hydrocarbonField';

class HydrocarbonFieldService {
  async getAll(): Promise<HydrocarbonFieldDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<HydrocarbonFieldDTO>> {
    const response = await axios.get<PageResponse<HydrocarbonFieldDTO>>(API_BASE, {
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
  ): Promise<PageResponse<HydrocarbonFieldDTO>> {
    const response = await axios.get<PageResponse<HydrocarbonFieldDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<HydrocarbonFieldDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: HydrocarbonFieldDTO): Promise<HydrocarbonFieldDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: HydrocarbonFieldDTO): Promise<HydrocarbonFieldDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }
}

export const hydrocarbonFieldService = new HydrocarbonFieldService();
