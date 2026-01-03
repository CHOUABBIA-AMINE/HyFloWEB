/**
 * Country Service - Localization Module
 * Handles API calls for Country entities
 * 
 * Backend Endpoint: /api/countries
 * Aligned with: dz.sh.trc.hyflo.general.localization.service
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

import type { CountryDTO } from '../dto/CountryDTO';

class CountryService {
  private baseUrl = '/api/countries';

  async getAll(): Promise<CountryDTO[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || data?.content || []);
  }

  async getById(id: number): Promise<CountryDTO> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async create(dto: Omit<CountryDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<CountryDTO> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async update(id: number, dto: Partial<CountryDTO>): Promise<CountryDTO> {
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

export const countryService = new CountryService();
