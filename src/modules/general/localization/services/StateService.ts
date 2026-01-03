/**
 * State Service - Localization Module
 * Handles API calls for State entities
 * 
 * Backend Endpoint: /api/states
 * Aligned with: dz.sh.trc.hyflo.general.localization.service
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

import type { StateDTO } from '../dto/StateDTO';

class StateService {
  private baseUrl = '/api/states';

  async getAll(): Promise<StateDTO[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || data?.content || []);
  }

  async getById(id: number): Promise<StateDTO> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async getByCountryId(countryId: number): Promise<StateDTO[]> {
    const res = await fetch(`${this.baseUrl}?countryId=${countryId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || data?.content || []);
  }

  async create(dto: Omit<StateDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<StateDTO> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async update(id: number, dto: Partial<StateDTO>): Promise<StateDTO> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  }
}

export const stateService = new StateService();
