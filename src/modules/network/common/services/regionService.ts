/**
 * Region Service
 * Mirrors backend controller: /network/common/region
 */

import axios from '../../../../shared/config/axios';
import { RegionDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/common/region';

class RegionService {
  async getAll(): Promise<RegionDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<RegionDTO>> {
    const response = await axios.get<PageResponse<RegionDTO>>(API_BASE, {
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
  ): Promise<PageResponse<RegionDTO>> {
    const response = await axios.get<PageResponse<RegionDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<RegionDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: RegionDTO): Promise<RegionDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: RegionDTO): Promise<RegionDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }

  async getByZone(zoneId: number): Promise<RegionDTO[]> {
    const response = await axios.get(`${API_BASE}/zone/${zoneId}`);
    return response.data;
  }

  async getByActivity(activityId: number): Promise<RegionDTO[]> {
    const response = await axios.get(`${API_BASE}/activity/${activityId}`);
    return response.data;
  }
}

export const regionService = new RegionService();
