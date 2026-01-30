/**
 * FlowOperation Service - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.service.FlowOperationService
 * 
 * Provides CRUD operations and search functionality for flow operations.
 * Flow operations track PRODUCED, TRANSPORTED, and CONSUMED volumes.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-30-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowOperationDTO } from '../dto/FlowOperationDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/operation';

export class FlowOperationService {
  /**
   * Get all flow operations with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all flow operations without pagination
   */
  static async getAllNoPagination(): Promise<FlowOperationDTO[]> {
    const response = await axiosInstance.get<FlowOperationDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get flow operation by ID
   */
  static async getById(id: number): Promise<FlowOperationDTO> {
    const response = await axiosInstance.get<FlowOperationDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new flow operation
   * Validates volume constraints and operation type
   */
  static async create(dto: FlowOperationDTO): Promise<FlowOperationDTO> {
    const response = await axiosInstance.post<FlowOperationDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing flow operation
   */
  static async update(id: number, dto: FlowOperationDTO): Promise<FlowOperationDTO> {
    const response = await axiosInstance.put<FlowOperationDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete flow operation by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all flow operation fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(`${BASE_URL}/search`, {
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
   * Get flow operations by infrastructure
   */
  static async getByInfrastructure(
    infrastructureId: number,
    pageable: Pageable
  ): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(
      `${BASE_URL}/infrastructure/${infrastructureId}`,
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
   * Get flow operations by product
   */
  static async getByProduct(
    productId: number,
    pageable: Pageable
  ): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(
      `${BASE_URL}/product/${productId}`,
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
   * Get flow operations by operation type
   * Type: PRODUCED, TRANSPORTED, or CONSUMED
   */
  static async getByType(
    typeId: number,
    pageable: Pageable
  ): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(
      `${BASE_URL}/type/${typeId}`,
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
   * Get flow operations by date range
   */
  static async getByDateRange(
    startDate: string,
    endDate: string,
    pageable: Pageable
  ): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(`${BASE_URL}/dateRange`, {
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
   * Get flow operations by validation status
   */
  static async getByValidationStatus(
    validationStatusId: number,
    pageable: Pageable
  ): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(
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
   * Get unvalidated flow operations
   */
  static async getUnvalidated(pageable: Pageable): Promise<Page<FlowOperationDTO>> {
    const response = await axiosInstance.get<Page<FlowOperationDTO>>(
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
   * Validate flow operation
   */
  static async validate(id: number, validatedById: number): Promise<FlowOperationDTO> {
    const response = await axiosInstance.post<FlowOperationDTO>(`${BASE_URL}/${id}/validate`, {
      validatedById,
    });
    return response.data;
  }

  /**
   * Get total volume by operation type and date range
   */
  static async getTotalVolumeByType(
    typeId: number,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const response = await axiosInstance.get<number>(`${BASE_URL}/totalVolume/type/${typeId}`, {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  }

  /**
   * Get daily summary by infrastructure
   */
  static async getDailySummary(
    infrastructureId: number,
    date: string
  ): Promise<FlowOperationDTO[]> {
    const response = await axiosInstance.get<FlowOperationDTO[]>(
      `${BASE_URL}/infrastructure/${infrastructureId}/daily`,
      {
        params: { date },
      }
    );
    return response.data;
  }
}
