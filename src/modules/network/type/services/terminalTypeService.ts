/**
 * Terminal Type Service
 * API service for managing terminal types
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-24-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { TerminalTypeDTO } from '../dto';

class TerminalTypeService {
  private readonly BASE_URL = '/network/type/terminal';

  /**
   * Get all terminal types (non-paginated)
   */
  async getAll(): Promise<TerminalTypeDTO[]> {
    const response = await axiosInstance.get<TerminalTypeDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get terminal type by ID
   */
  async getById(id: number): Promise<TerminalTypeDTO> {
    const response = await axiosInstance.get<TerminalTypeDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}

export const terminalTypeService = new TerminalTypeService();
