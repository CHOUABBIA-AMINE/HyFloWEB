/**
 * FlowForecast Service - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.service.FlowForecastService
 * 
 * Provides CRUD operations and search functionality for flow forecasts.
 * Flow forecasts predict future flow volumes based on historical data.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-25-2026
 * @updated 01-30-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowForecastDTO } from '../dto/FlowForecastDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/forecast';

export class FlowForecastService {
  /**
   * Get all flow forecasts with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FlowForecastDTO>> {
    const response = await axiosInstance.get<Page<FlowForecastDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all flow forecasts without pagination
   */
  static async getAllNoPagination(): Promise<FlowForecastDTO[]> {
    const response = await axiosInstance.get<FlowForecastDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get flow forecast by ID
   */
  static async getById(id: number): Promise<FlowForecastDTO> {
    const response = await axiosInstance.get<FlowForecastDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new flow forecast
   */
  static async create(dto: FlowForecastDTO): Promise<FlowForecastDTO> {
    const response = await axiosInstance.post<FlowForecastDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing flow forecast
   */
  static async update(id: number, dto: FlowForecastDTO): Promise<FlowForecastDTO> {
    const response = await axiosInstance.put<FlowForecastDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete flow forecast by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all flow forecast fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<FlowForecastDTO>> {
    const response = await axiosInstance.get<Page<FlowForecastDTO>>(`${BASE_URL}/search`, {
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
   * Get forecasts by infrastructure
   */
  static async getByInfrastructure(
    infrastructureId: number,
    pageable: Pageable
  ): Promise<Page<FlowForecastDTO>> {
    const response = await axiosInstance.get<Page<FlowForecastDTO>>(
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
   * Get forecasts by product
   */
  static async getByProduct(
    productId: number,
    pageable: Pageable
  ): Promise<Page<FlowForecastDTO>> {
    const response = await axiosInstance.get<Page<FlowForecastDTO>>(
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
   * Get forecasts by operation type
   */
  static async getByOperationType(
    operationTypeId: number,
    pageable: Pageable
  ): Promise<Page<FlowForecastDTO>> {
    const response = await axiosInstance.get<Page<FlowForecastDTO>>(
      `${BASE_URL}/operationType/${operationTypeId}`,
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
   * Get forecasts by date range
   */
  static async getByDateRange(
    startDate: string,
    endDate: string,
    pageable: Pageable
  ): Promise<Page<FlowForecastDTO>> {
    const response = await axiosInstance.get<Page<FlowForecastDTO>>(`${BASE_URL}/dateRange`, {
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
   * Get latest forecast by infrastructure and product
   */
  static async getLatest(
    infrastructureId: number,
    productId: number
  ): Promise<FlowForecastDTO> {
    const response = await axiosInstance.get<FlowForecastDTO>(`${BASE_URL}/latest`, {
      params: {
        infrastructureId,
        productId,
      },
    });
    return response.data;
  }

  /**
   * Get forecasts by supervisor
   */
  static async getBySupervisor(
    supervisorId: number,
    pageable: Pageable
  ): Promise<Page<FlowForecastDTO>> {
    const response = await axiosInstance.get<Page<FlowForecastDTO>>(
      `${BASE_URL}/supervisor/${supervisorId}`,
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
   * Calculate and update forecast accuracy
   * Compares predicted volume with actual volume
   */
  static async calculateAccuracy(id: number): Promise<FlowForecastDTO> {
    const response = await axiosInstance.post<FlowForecastDTO>(`${BASE_URL}/${id}/calculate-accuracy`);
    return response.data;
  }

  /**
   * Update actual volume for a forecast
   */
  static async updateActualVolume(
    id: number,
    actualVolume: number
  ): Promise<FlowForecastDTO> {
    const response = await axiosInstance.patch<FlowForecastDTO>(`${BASE_URL}/${id}/actual-volume`, {
      actualVolume,
    });
    return response.data;
  }

  /**
   * Adjust forecast volume with notes
   */
  static async adjustForecast(
    id: number,
    adjustedVolume: number,
    adjustmentNotes: string
  ): Promise<FlowForecastDTO> {
    const response = await axiosInstance.patch<FlowForecastDTO>(`${BASE_URL}/${id}/adjust`, {
      adjustedVolume,
      adjustmentNotes,
    });
    return response.data;
  }
}
