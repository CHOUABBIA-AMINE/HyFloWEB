/**
 * Structure Type Service
 * Handles API calls for structure type management
 * 
 * Backend endpoint: /api/structure-types
 * Backend controller: dz.sh.trc.hyflo.general.type.controller.StructureTypeController
 * 
 * @author CHOUABBIA Amine
 * @created 01-03-2026
 */

import axios from 'axios';
import { StructureTypeDTO } from '../dto/StructureTypeDTO';

const API_URL = '/api/structure-types';

class StructureTypeService {
  /**
   * Get all structure types
   * @returns Promise with array of structure types
   */
  async getAll(): Promise<StructureTypeDTO[]> {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching structure types:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch structure types');
    }
  }

  /**
   * Get active structure types only
   * @returns Promise with array of active structure types
   */
  async getActive(): Promise<StructureTypeDTO[]> {
    try {
      const response = await axios.get(`${API_URL}/active`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active structure types:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active structure types');
    }
  }

  /**
   * Get structure type by ID
   * @param id - Structure type ID
   * @returns Promise with structure type details
   */
  async getById(id: number): Promise<StructureTypeDTO> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching structure type ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to fetch structure type ${id}`);
    }
  }

  /**
   * Get structure type by code
   * @param code - Structure type code
   * @returns Promise with structure type details
   */
  async getByCode(code: string): Promise<StructureTypeDTO> {
    try {
      const response = await axios.get(`${API_URL}/code/${code}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching structure type with code ${code}:`, error);
      throw new Error(error.response?.data?.message || `Failed to fetch structure type with code ${code}`);
    }
  }

  /**
   * Create a new structure type
   * @param structureType - Structure type data to create
   * @returns Promise with created structure type
   */
  async create(structureType: Omit<StructureTypeDTO, 'id'>): Promise<StructureTypeDTO> {
    try {
      const response = await axios.post(API_URL, structureType);
      return response.data;
    } catch (error: any) {
      console.error('Error creating structure type:', error);
      throw new Error(error.response?.data?.message || 'Failed to create structure type');
    }
  }

  /**
   * Update an existing structure type
   * @param id - Structure type ID
   * @param structureType - Updated structure type data
   * @returns Promise with updated structure type
   */
  async update(id: number, structureType: Partial<StructureTypeDTO>): Promise<StructureTypeDTO> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, structureType);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating structure type ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to update structure type ${id}`);
    }
  }

  /**
   * Delete a structure type
   * @param id - Structure type ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting structure type ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to delete structure type ${id}`);
    }
  }

  /**
   * Toggle active status of a structure type
   * @param id - Structure type ID
   * @returns Promise with updated structure type
   */
  async toggleActive(id: number): Promise<StructureTypeDTO> {
    try {
      const response = await axios.patch(`${API_URL}/${id}/toggle-active`);
      return response.data;
    } catch (error: any) {
      console.error(`Error toggling structure type ${id} active status:`, error);
      throw new Error(error.response?.data?.message || `Failed to toggle structure type ${id} active status`);
    }
  }
}

// Export singleton instance
const structureTypeService = new StructureTypeService();
export default structureTypeService;
export { structureTypeService, StructureTypeService };
