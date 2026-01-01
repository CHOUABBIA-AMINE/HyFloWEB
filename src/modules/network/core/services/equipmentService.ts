/**
 * Equipment Service
 * Mirrors backend controller: /network/core/equipment
 */

import axios from '../../../../shared/config/axios';
import { EquipmentDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/equipment';

class EquipmentService {
  async getAll(): Promise<EquipmentDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<EquipmentDTO>> {
    const response = await axios.get<PageResponse<EquipmentDTO>>(API_BASE, {
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
  ): Promise<PageResponse<EquipmentDTO>> {
    const response = await axios.get<PageResponse<EquipmentDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<EquipmentDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: EquipmentDTO): Promise<EquipmentDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: EquipmentDTO): Promise<EquipmentDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }

  async getByFacility(facilityId: number): Promise<EquipmentDTO[]> {
    const response = await axios.get(`${API_BASE}/facility/${facilityId}`);
    return response.data;
  }

  async getByType(typeId: number): Promise<EquipmentDTO[]> {
    const response = await axios.get(`${API_BASE}/type/${typeId}`);
    return response.data;
  }
}

export const equipmentService = new EquipmentService();
