/**
 * State Service
 * API service for managing states
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-24-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { StateDTO } from '../dto';

class StateService {
  private readonly BASE_URL = '/common/administration/state';

  /**
   * Get all states (non-paginated)
   */
  async getAll(): Promise<StateDTO[]> {
    const response = await axiosInstance.get<StateDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get state by ID
   */
  async getById(id: number): Promise<StateDTO> {
    const response = await axiosInstance.get<StateDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}

export const stateService = new StateService();
