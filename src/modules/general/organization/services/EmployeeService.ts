/**
 * Employee Service - General Organization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.organization.service.EmployeeService
 * 
 * Provides CRUD operations and search functionality for employees.
 * Employees represent persons who work in jobs within structures.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { EmployeeDTO } from '../dto/EmployeeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/general/organization/employees';

export class EmployeeService {
  /**
   * Get all employees with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<EmployeeDTO>> {
    const response = await apiClient.get<Page<EmployeeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all employees without pagination
   */
  static async getAllNoPagination(): Promise<EmployeeDTO[]> {
    const response = await apiClient.get<EmployeeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get employee by ID
   */
  static async getById(id: number): Promise<EmployeeDTO> {
    const response = await apiClient.get<EmployeeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new employee
   * Backend logs: "Creating employee: registrationNumber={registrationNumber}"
   */
  static async create(dto: EmployeeDTO): Promise<EmployeeDTO> {
    const response = await apiClient.post<EmployeeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing employee
   * Backend logs: "Updating employee with ID: {id}"
   */
  static async update(id: number, dto: EmployeeDTO): Promise<EmployeeDTO> {
    const response = await apiClient.put<EmployeeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete employee by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all employee fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<EmployeeDTO>> {
    const response = await apiClient.get<Page<EmployeeDTO>>(`${BASE_URL}/search`, {
      params: {
        q: searchTerm,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get employees by structure ID
   * Finds employees whose job belongs to the specified structure
   */
  static async getByStructureId(structureId: number): Promise<EmployeeDTO[]> {
    const response = await apiClient.get<EmployeeDTO[]>(`${BASE_URL}/by-structure/${structureId}`);
    return response.data;
  }
}
