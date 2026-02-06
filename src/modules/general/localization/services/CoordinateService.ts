/**
 * Coordinate Service
 * API service for managing coordinate data (pipeline route waypoints)
 * 
 * Aligned with backend: /general/localization/coordinate
 * 
 * @author CHOUABBIA Amine
 * @created 02-06-2026
 */

import axiosInstance from '@/shared/config/axios';
import { CoordinateDTO } from '../dto/CoordinateDTO';

const BASE_URL = '/general/localization/coordinate';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const CoordinateService = {
  /**
   * Get all coordinates with pagination
   */
  getAll: async (page: number = 0, size: number = 20): Promise<PageResponse<CoordinateDTO>> => {
    const response = await axiosInstance.get(BASE_URL, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get all coordinates without pagination
   */
  getAllNoPagination: async (): Promise<CoordinateDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/all`);
    return response.data;
  },

  /**
   * Get coordinate by ID
   */
  getById: async (id: number): Promise<CoordinateDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get coordinates by infrastructure ID
   */
  getByInfrastructure: async (infrastructureId: number): Promise<CoordinateDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/infrastructure/${infrastructureId}`);
    return response.data;
  },

  /**
   * Get multiple coordinates by their IDs
   */
  getByIds: async (ids: number[]): Promise<CoordinateDTO[]> => {
    if (!ids || ids.length === 0) return [];
    
    // Fetch all coordinates in parallel
    const promises = ids.map(id => 
      axiosInstance.get(`${BASE_URL}/${id}`)
        .then(response => response.data)
        .catch(error => {
          console.error(`Error fetching coordinate ${id}:`, error);
          return null;
        })
    );
    
    const results = await Promise.all(promises);
    return results.filter((coord): coord is CoordinateDTO => coord !== null);
  },

  /**
   * Create new coordinate
   */
  create: async (coordinate: Partial<CoordinateDTO>): Promise<CoordinateDTO> => {
    const response = await axiosInstance.post(BASE_URL, coordinate);
    return response.data;
  },

  /**
   * Update existing coordinate
   */
  update: async (id: number, coordinate: Partial<CoordinateDTO>): Promise<CoordinateDTO> => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, coordinate);
    return response.data;
  },

  /**
   * Delete coordinate
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Create multiple coordinates at once (for pipeline routes)
   */
  createBatch: async (coordinates: Partial<CoordinateDTO>[]): Promise<CoordinateDTO[]> => {
    const promises = coordinates.map(coord => 
      axiosInstance.post(BASE_URL, coord).then(response => response.data)
    );
    return Promise.all(promises);
  },

  /**
   * Delete multiple coordinates (cleanup for pipeline updates)
   */
  deleteBatch: async (ids: number[]): Promise<void> => {
    const promises = ids.map(id => axiosInstance.delete(`${BASE_URL}/${id}`));
    await Promise.all(promises);
  },
};
