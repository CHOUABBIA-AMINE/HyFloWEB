/**
 * Locality Service
 * Handles API calls for Locality entities
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

import { LocalityDTO } from '../dto/LocalityDTO';

class LocalityService {
  private baseUrl = '/api/localities';

  async getAll(): Promise<LocalityDTO[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || data?.content || []);
    } catch (error) {
      console.error('Error fetching localities:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<LocalityDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching locality ${id}:`, error);
      throw error;
    }
  }

  async getByStateId(stateId: number): Promise<LocalityDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}?stateId=${stateId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || data?.content || []);
    } catch (error) {
      console.error(`Error fetching localities for state ${stateId}:`, error);
      throw error;
    }
  }

  async create(locality: LocalityDTO): Promise<LocalityDTO> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locality),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating locality:', error);
      throw error;
    }
  }

  async update(id: number, locality: LocalityDTO): Promise<LocalityDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locality),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating locality ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting locality ${id}:`, error);
      throw error;
    }
  }
}

export const localityService = new LocalityService();
