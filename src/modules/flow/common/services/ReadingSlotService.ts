/**
 * Reading Slot Service - Flow Common Module
 * 
 * Handles API calls for reading slot management
 * Backend endpoint: /flow/common/reading-slot
 * 
 * @author CHOUABBIA Amine
 * @created 01-28-2026
 */

import axiosInstance from '@/shared/config/axios';
import { ReadingSlotDTO } from '../dto/ReadingSlotDTO';

const BASE_URL = '/flow/common/readingSlot';

export class ReadingSlotService {
  /**
   * Get all available reading slots (global, shared by all pipelines)
   * Backend: GET /flow/common/reading-slot
   */
  static async getAll(): Promise<ReadingSlotDTO[]> {
    const response = await axiosInstance.get<ReadingSlotDTO[]>(BASE_URL);
    return response.data;
  }

  /**
   * Get reading slots ordered by display order
   */
  static async getAllOrdered(): Promise<ReadingSlotDTO[]> {
    const slots = await this.getAll();
    
    // Defensive check: ensure slots is an array
    if (!Array.isArray(slots)) {
      console.error('getAllOrdered: Expected array but got:', typeof slots, slots);
      return [];
    }
    
    return slots.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  /**
   * Get a single reading slot by ID
   * Backend: GET /flow/common/reading-slot/{id}
   */
  static async getById(id: number): Promise<ReadingSlotDTO> {
    const response = await axiosInstance.get<ReadingSlotDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get reading slot by code
   * Backend: GET /flow/common/reading-slot/code/{code}
   */
  static async getByCode(code: string): Promise<ReadingSlotDTO> {
    const response = await axiosInstance.get<ReadingSlotDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create a new reading slot
   * Backend: POST /flow/common/reading-slot
   */
  static async create(data: ReadingSlotDTO): Promise<ReadingSlotDTO> {
    const response = await axiosInstance.post<ReadingSlotDTO>(BASE_URL, data);
    return response.data;
  }

  /**
   * Update an existing reading slot
   * Backend: PUT /flow/common/reading-slot/{id}
   */
  static async update(id: number, data: ReadingSlotDTO): Promise<ReadingSlotDTO> {
    const response = await axiosInstance.put<ReadingSlotDTO>(`${BASE_URL}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a reading slot
   * Backend: DELETE /flow/common/reading-slot/{id}
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Search reading slots
   * Backend: GET /flow/common/reading-slot/search?search={query}&page={page}&size={size}
   */
  static async search(
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<{
    content: ReadingSlotDTO[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const response = await axiosInstance.get(`${BASE_URL}/search`, {
      params: {
        search: query,
        page,
        size,
      },
    });
    return response.data;
  }
}

export default ReadingSlotService;
