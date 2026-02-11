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
 * @updated 01-27-2026 - Updated validate/reject to use query params
 * @updated 01-28-2026 - Added slot-based query methods
 * @updated 01-28-2026 - Fixed getLatestByPipeline to handle wrapped responses
 * @updated 02-11-2026 - Removed workflow methods (moved to ReadingWorkflowService)
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/flow/core/reading';

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
   * Handles both direct DTO response and potential wrapped responses
   */
  static async getLatestByPipeline(pipelineId: number): Promise<FlowReadingDTO> {
    const response = await axiosInstance.get<any>(
      `${BASE_URL}/pipeline/${pipelineId}/latest`
    );
    
    // Log the raw response for debugging
    console.log('Raw API response for latest reading:', response.data);
    
    // Check if response is wrapped (has a data property or similar)
    if (response.data && typeof response.data === 'object') {
      // If it has an 'id' property, it's likely the direct DTO
      if ('id' in response.data) {
        return response.data;
      }
      
      // Check for common wrapper properties
      if ('data' in response.data) {
        return response.data.data;
      }
      
      if ('content' in response.data) {
        // Might be a paginated response - get first item
        const content = response.data.content;
        if (Array.isArray(content) && content.length > 0) {
          return content[0];
        }
      }
      
      // If we can't determine the structure, return as-is and let the component handle it
      return response.data;
    }
    
    return response.data;
  }

  // ========== Slot-based query methods ==========

  /**
   * Get all readings for a specific pipeline on a specific date
   * Backend: GET /flow/core/reading/pipeline/{pipelineId}/date/{date}
   * 
   * @param pipelineId - Pipeline ID
   * @param date - Reading date in YYYY-MM-DD format
   * @returns Array of readings ordered by slot display order
   */
  static async getByPipelineAndDate(
    pipelineId: number,
    date: string
  ): Promise<FlowReadingDTO[]> {
    const response = await axiosInstance.get<FlowReadingDTO[]>(
      `${BASE_URL}/pipeline/${pipelineId}/date/${date}`
    );
    return response.data;
  }

  /**
   * Get readings for a pipeline within a date range
   * Backend: GET /flow/core/reading/pipeline/{pipelineId}/range?startDate={start}&endDate={end}
   * 
   * @param pipelineId - Pipeline ID
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Array of readings ordered by date and slot
   */
  static async getByPipelineAndDateRange(
    pipelineId: number,
    startDate: string,
    endDate: string
  ): Promise<FlowReadingDTO[]> {
    const response = await axiosInstance.get<FlowReadingDTO[]>(
      `${BASE_URL}/pipeline/${pipelineId}/range`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );
    return response.data;
  }

  /**
   * Get today's readings for a pipeline
   * Convenience method that calls getByPipelineAndDate with today's date
   * 
   * @param pipelineId - Pipeline ID
   * @returns Array of today's readings ordered by slot
   */
  static async getTodayReadings(pipelineId: number): Promise<FlowReadingDTO[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.getByPipelineAndDate(pipelineId, today);
  }

  /**
   * Get this week's readings for a pipeline
   * Convenience method for getting current week's data
   * 
   * @param pipelineId - Pipeline ID
   * @returns Array of this week's readings
   */
  static async getThisWeekReadings(pipelineId: number): Promise<FlowReadingDTO[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    return this.getByPipelineAndDateRange(pipelineId, startDate, endDate);
  }

  /**
   * Get this month's readings for a pipeline
   * Convenience method for getting current month's data
   * 
   * @param pipelineId - Pipeline ID
   * @returns Array of this month's readings
   */
  static async getThisMonthReadings(pipelineId: number): Promise<FlowReadingDTO[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    return this.getByPipelineAndDateRange(pipelineId, startDate, endDate);
  }

  // ========== WORKFLOW METHODS REMOVED ==========

  /**
   * ⚠️ DEPRECATED: Workflow methods moved to ReadingWorkflowService
   * 
   * The following methods were removed to maintain Single Responsibility Principle:
   * 
   * 1. validate(id: number, validatedById: number)
   *    ❌ REMOVED from FlowReadingService
   *    ✅ Use: ReadingWorkflowService.validate(id, validatedById)
   *    📍 Path: POST /flow/core/workflow/readings/{id}/validate
   *    📦 Import: import { ReadingWorkflowService } from '@/modules/flow/workflow/services';
   * 
   * 2. reject(id: number, rejectedById: number, rejectionReason: string)
   *    ❌ REMOVED from FlowReadingService
   *    ✅ Use: ReadingWorkflowService.reject(id, rejectedById, rejectionReason)
   *    📍 Path: POST /flow/core/workflow/readings/{id}/reject
   *    📦 Import: import { ReadingWorkflowService } from '@/modules/flow/workflow/services';
   * 
   * Backend Alignment:
   * - Backend separated workflow operations on Feb 10, 2026
   * - Old endpoints (/flow/core/reading/{id}/validate) were removed
   * - New endpoints (/flow/core/workflow/readings/{id}/validate) created
   * 
   * Migration Example:
   * ```typescript
   * // ❌ OLD (will not work - endpoints removed from backend)
   * import { FlowReadingService } from '@/modules/flow/core/services';
   * await FlowReadingService.validate(123, 456);
   * await FlowReadingService.reject(123, 456, 'Invalid data');
   * 
   * // ✅ NEW (correct implementation)
   * import { ReadingWorkflowService } from '@/modules/flow/workflow/services';
   * await ReadingWorkflowService.validate(123, 456);
   * await ReadingWorkflowService.reject(123, 456, 'Invalid data');
   * ```
   * 
   * Architecture:
   * - FlowReadingService: CRUD operations only
   * - ReadingWorkflowService: State transitions (validate, reject)
   * - FlowMonitoringService: Analytics and monitoring queries
   */
}
