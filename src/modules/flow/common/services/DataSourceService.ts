/**
 * DataSource Service - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.service.DataSourceService
 * 
 * Provides CRUD operations and search functionality for data sources.
 * Data sources identify the origin of flow measurement data (MANUAL_ENTRY, EXCEL_IMPORT, SCADA_EXPORT, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { DataSourceDTO } from '../dto/DataSourceDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/common/dataSource';

export class DataSourceService {
  /**
   * Get all data sources with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<DataSourceDTO>> {
    const response = await axiosInstance.get<Page<DataSourceDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all data sources without pagination
   * Useful for dropdowns and form selects
   */
  static async getAllNoPagination(): Promise<DataSourceDTO[]> {
    const response = await axiosInstance.get<DataSourceDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get data source by ID
   */
  static async getById(id: number): Promise<DataSourceDTO> {
    const response = await axiosInstance.get<DataSourceDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Get data source by code
   * Codes: MANUAL_ENTRY, EXCEL_IMPORT, SCADA_EXPORT, METER_READING, ESTIMATED
   */
  static async getByCode(code: string): Promise<DataSourceDTO> {
    const response = await axiosInstance.get<DataSourceDTO>(`${BASE_URL}/code/${code}`);
    return response.data;
  }

  /**
   * Create new data source
   * Validates that code doesn't already exist
   * Code must match pattern: ^[A-Z0-9_-]+$ (2-50 chars)
   */
  static async create(dto: DataSourceDTO): Promise<DataSourceDTO> {
    const response = await axiosInstance.post<DataSourceDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing data source
   * Validates that code doesn't exist for other records
   */
  static async update(id: number, dto: DataSourceDTO): Promise<DataSourceDTO> {
    const response = await axiosInstance.put<DataSourceDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete data source by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all data source fields
   * Searches in code, designation, and description fields (Arabic, French, English)
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<DataSourceDTO>> {
    const response = await axiosInstance.get<Page<DataSourceDTO>>(`${BASE_URL}/search`, {
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
   * Check if data source code exists
   * Useful for validation before create/update
   */
  static async codeExists(code: string, excludeId?: number): Promise<boolean> {
    const response = await axiosInstance.get<boolean>(`${BASE_URL}/exists`, {
      params: {
        code,
        excludeId,
      },
    });
    return response.data;
  }

  /**
   * Get automated data sources
   * Returns data sources representing automated systems (e.g., SCADA_EXPORT)
   */
  static async getAutomatedSources(): Promise<DataSourceDTO[]> {
    const response = await axiosInstance.get<DataSourceDTO[]>(`${BASE_URL}/automated`);
    return response.data;
  }

  /**
   * Get manual data sources
   * Returns data sources representing manual entry methods
   */
  static async getManualSources(): Promise<DataSourceDTO[]> {
    const response = await axiosInstance.get<DataSourceDTO[]>(`${BASE_URL}/manual`);
    return response.data;
  }
}
