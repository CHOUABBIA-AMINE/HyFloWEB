/**
 * Facility Service
 * Handles API calls for Facility CRUD operations
 */

import axios from '../../../../shared/config/axios';
import { FacilityDTO } from '../dto';
import { PageResponse } from '../../../../shared/types/PageResponse';

const API_BASE = '/network/core/facility';

class FacilityService {
  async getAll(): Promise<FacilityDTO[]> {
    const response = await axios.get(`${API_BASE}/all`);
    return response.data;
  }

  async getPage(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<PageResponse<FacilityDTO>> {
    const response = await axios.get<PageResponse<FacilityDTO>>(API_BASE, {
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
  ): Promise<PageResponse<FacilityDTO>> {
    const response = await axios.get<PageResponse<FacilityDTO>>(`${API_BASE}/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
    return response.data;
  }

  async getById(id: number): Promise<FacilityDTO> {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async create(data: FacilityDTO): Promise<FacilityDTO> {
    const response = await axios.post(API_BASE, { ...data, id: null });
    return response.data;
  }

  async update(id: number, data: FacilityDTO): Promise<FacilityDTO> {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }

  async getByLocality(localityId: number): Promise<FacilityDTO[]> {
    const response = await axios.get(`${API_BASE}/locality/${localityId}`);
    return response.data;
  }

  async getByVendor(vendorId: number): Promise<FacilityDTO[]> {
    const response = await axios.get(`${API_BASE}/vendor/${vendorId}`);
    return response.data;
  }

  async getByOperationalStatus(operationalStatusId: number): Promise<FacilityDTO[]> {
    const response = await axios.get(`${API_BASE}/operationalStatus/${operationalStatusId}`);
    return response.data;
  }
}

export const facilityService = new FacilityService();
