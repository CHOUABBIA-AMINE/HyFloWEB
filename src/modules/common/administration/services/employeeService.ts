/**
 * Employee Service
 * Handles all API calls for employee management
 * 
 * @author CHOUABBIA Amine
 * @created 12-30-2025
 * @updated 01-01-2026 - Set id=null on create to prevent conflicts
 */

import axiosInstance from '../../../../shared/config/axios';
import { EmployeeDTO } from '../dto';

const BASE_URL = '/common/administration/employee';

export const employeeService = {
  /**
   * Get all employees with pagination
   */
  getAll: async (page: number = 0, size: number = 20, sortBy: string = 'id', sortDir: string = 'asc') => {
    const response = await axiosInstance.get(BASE_URL, {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  /**
   * Get all employees as list (no pagination)
   */
  getAllList: async (): Promise<EmployeeDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/list`);
    return response.data;
  },

  /**
   * Get employee by ID
   */
  getById: async (id: number): Promise<EmployeeDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new employee
   * Always send id=null to prevent conflict (409) errors
   */
  create: async (employee: EmployeeDTO): Promise<EmployeeDTO> => {
    const response = await axiosInstance.post(BASE_URL, { ...employee, id: null });
    return response.data;
  },

  /**
   * Update existing employee
   */
  update: async (id: number, employee: EmployeeDTO): Promise<EmployeeDTO> => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, employee);
    return response.data;
  },

  /**
   * Delete employee
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Search employees
   */
  search: async (query: string, page: number = 0, size: number = 20) => {
    const response = await axiosInstance.get(`${BASE_URL}/search`, {
      params: { q: query, page, size }
    });
    return response.data;
  },
};
