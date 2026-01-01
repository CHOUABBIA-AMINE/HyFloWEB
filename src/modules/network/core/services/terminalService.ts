/**
 * Terminal Service
 * Handles API calls for Terminal CRUD operations
 *
 * Note: Keeps extra endpoints (getByCode/getByFacility) as requested.
 */

import axios from '../../../../shared/config/axios';
import { TerminalDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/terminal';

class TerminalService {
  async getAll(): Promise<TerminalDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<TerminalDTO>> {
    const response = await axios.get<PageResponse<TerminalDTO>>(API_BASE, {
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
  ): Promise<PageResponse<TerminalDTO>> {
    const response = await axios.get<PageResponse<TerminalDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<TerminalDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  // Extra endpoints kept
  async getByCode(code: string): Promise<TerminalDTO> {
    const response = await axios.get(`${API_BASE}/code/${code}`);
    return response.data;
  }

  async getByFacility(facilityId: number): Promise<TerminalDTO[]> {
    const response = await axios.get(`${API_BASE}/facility/${facilityId}`);
    return response.data;
  }

  async create(data: TerminalDTO): Promise<TerminalDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: TerminalDTO): Promise<TerminalDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }
}

export const terminalService = new TerminalService();
