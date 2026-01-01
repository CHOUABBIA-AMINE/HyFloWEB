/**
 * Partner Service
 * Mirrors backend controller: /network/common/partner
 */

import axios from '../../../../shared/config/axios';
import { PartnerDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/common/partner';

class PartnerService {
  async getAll(): Promise<PartnerDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<PartnerDTO>> {
    const response = await axios.get<PageResponse<PartnerDTO>>(API_BASE, {
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
  ): Promise<PageResponse<PartnerDTO>> {
    const response = await axios.get<PageResponse<PartnerDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<PartnerDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: PartnerDTO): Promise<PartnerDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: PartnerDTO): Promise<PartnerDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }
}

export const partnerService = new PartnerService();
