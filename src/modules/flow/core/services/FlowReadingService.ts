/**
 * FlowReading Service - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.service.FlowReadingService
 * 
 * Provides CRUD operations and search functionality for flow readings.
 * Flow readings capture pipeline operational parameters (pressure, temperature, flow rate, volume).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-25-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/flowReading';

export class FlowReadingService {
  /**
   * Get all flow readings with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FlowReadingDTO>> {
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all flow readings without pagination
   */
  static async getAllNoPagination(): Promise<FlowReadingDTO[]> {
    const response = await axiosInstance.get<FlowReadingDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get flow reading by ID
   */
  static async getById(id: number): Promise<FlowReadingDTO> {
    const response = await axiosInstance.get<FlowReadingDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new flow reading
   * Validates measurement constraints (pressure, temperature, flow rate)
   */
  static async create(dto: FlowReadingDTO): Promise<FlowReadingDTO> {
    const response = await axiosInstance.post<FlowReadingDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing flow reading
   * Validates measurement constraints
   */
  static async update(id: number, dto: FlowReadingDTO): Promise<FlowReadingDTO> {
    const response = await axiosInstance.put<FlowReadingDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete flow reading by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all flow reading fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FlowReadingDTO>> {
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(`${BASE_URL}/search`, {
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
   * Get flow readings by pipeline
   */
  static async getByPipeline(
    pipelineId: number,
    pageable: Pageable
  ): Promise<Page<FlowReadingDTO>> {
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(
      `${BASE_URL}/pipeline/${pipelineId}`,
      {
        params: {
          page: pageable.page,
          size: pageable.size,
          sort: pageable.sort,
        },
      }
    );
    return response.data;
  }

  /**
   * Get flow readings by date range
   */
  static async getByDateRange(
    startDate: string,
    endDate: string,
    pageable: Pageable
  ): Promise<Page<FlowReadingDTO>> {
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(`${BASE_URL}/dateRange`, {
      params: {
        startDate,
        endDate,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get flow readings by validation status
   */
  static async getByValidationStatus(
    validationStatusId: number,
    pageable: Pageable
  ): Promise<Page<FlowReadingDTO>> {
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(
      `${BASE_URL}/validationStatus/${validationStatusId}`,
      {
        params: {
          page: pageable.page,
          size: pageable.size,
          sort: pageable.sort,
        },
      }
    );
    return response.data;
  }

  /**
   * Get unvalidated flow readings
   * Returns readings with DRAFT or PENDING validation status
   */
  static async getUnvalidated(pageable: Pageable): Promise<Page<FlowReadingDTO>> {
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(
      `${BASE_URL}/unvalidated`,
      {
        params: {
          page: pageable.page,
          size: pageable.size,
          sort: pageable.sort,
        },
      }
    );
    return response.data;
  }

  /**
   * Validate flow reading
   * Updates validation status and sets validated timestamp
   */
  static async validate(id: number, validatedById: number): Promise<FlowReadingDTO> {
    const response = await axiosInstance.post<FlowReadingDTO>(`${BASE_URL}/${id}/validate`, {
      validatedById,
    });
    return response.data;
  }

  /**
   * Get flow readings with anomalies
   * Returns readings with values outside normal ranges
   */
  static async getWithAnomalies(pageable: Pageable): Promise<Page<FlowReadingDTO>> {
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(`${BASE_URL}/anomalies`, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get latest reading by pipeline
   */
  static async getLatestByPipeline(pipelineId: number): Promise<FlowReadingDTO> {
    const response = await axiosInstance.get<FlowReadingDTO>(
      `${BASE_URL}/pipeline/${pipelineId}/latest`
    );
    return response.data;
  }
}
