/**
 * State Service
 * Handles API calls for State entities
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

import { StateDTO } from '../dto/StateDTO';

class StateService {
  private baseUrl = '/api/states';

  async getAll(): Promise<StateDTO[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || data?.content || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<StateDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching state ${id}:`, error);
      throw error;
    }
  }

  async create(state: StateDTO): Promise<StateDTO> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating state:', error);
      throw error;
    }
  }

  async update(id: number, state: StateDTO): Promise<StateDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating state ${id}:`, error);
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
      console.error(`Error deleting state ${id}:`, error);
      throw error;
    }
  }
}

export const stateService = new StateService();
