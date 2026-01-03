/**
 * Locality Service - Localization Module
 * Handles API calls for Locality entities
 * 
 * Backend Endpoint: /api/localities
 * Aligned with: dz.sh.trc.hyflo.general.localization.service
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

import type { LocalityDTO } from '../dto/LocalityDTO';

class LocalityService {
  private baseUrl = '/api/localities';

  async getAll(): Promise<LocalityDTO[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || data?.content || []);
  }

  async getById(id: number): Promise<LocalityDTO> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async getByStateId(stateId: number): Promise<LocalityDTO[]> {
    const res = await fetch(`${this.baseUrl}?stateId=${stateId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || data?.content || []);
  }

  async create(dto: Omit<LocalityDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalityDTO> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async update(id: number, dto: Partial<LocalityDTO>): Promise<LocalityDTO> {
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

export const localityService = new LocalityService();
