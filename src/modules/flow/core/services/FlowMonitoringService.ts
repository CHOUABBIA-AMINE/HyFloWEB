/**
 * Flow Monitoring Service
 * 
 * Service for slot-centric flow monitoring APIs.
 * Aligns with backend /flow/core/monitoring endpoints.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Refactored to separate DTOs, types, and helpers
 * @module flow/core/services
 */

import axiosInstance from '@/shared/config/axios';
import { SlotCoverageRequestDTO } from '../dto/SlotCoverageRequestDTO';
import { SlotCoverageResponseDTO } from '../dto/SlotCoverageResponseDTO';
import { ReadingSubmitRequestDTO } from '../dto/ReadingSubmitRequestDTO';
import { ReadingValidationRequestDTO } from '../dto/ReadingValidationRequestDTO';

/**
 * FlowMonitoringService
 * 
 * Provides slot-centric monitoring API operations.
 * Base URL is already set in axiosInstance (/hyflo/api), so paths are relative.
 */
export class FlowMonitoringService {
  
  // BASE_PATH is relative to axiosInstance baseURL (/hyflo/api)
  // Full URL: /hyflo/api/flow/core/monitoring
  private static readonly BASE_PATH = '/flow/core/monitoring';

  // ==================== SLOT COVERAGE ====================

  /**
   * Get slot coverage for date + slot + structure.
   * 
   * Backend: POST /hyflo/api/flow/core/monitoring/slot-coverage
   * 
   * @param request - Slot coverage request
   * @returns Slot coverage with pipeline statuses
   */
  static async getSlotCoverage(
    request: SlotCoverageRequestDTO
  ): Promise<SlotCoverageResponseDTO> {
    try {
      const response = await axiosInstance.post<SlotCoverageResponseDTO>(
        `${this.BASE_PATH}/slot-coverage`,
        request
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        `Failed to load slot coverage for ${request.readingDate}, slot ${request.slotId}`
      );
    }
  }

  // ==================== READING SUBMISSION ====================

  /**
   * Submit or update a reading.
   * 
   * Backend: POST /hyflo/api/flow/core/monitoring/readings/submit
   * 
   * @param request - Reading submit request
   * @returns Success (void)
   */
  static async submitReading(
    request: ReadingSubmitRequestDTO
  ): Promise<void> {
    try {
      await axiosInstance.post(
        `${this.BASE_PATH}/readings/submit`,
        request
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        'Failed to submit reading'
      );
    }
  }

  // ==================== READING VALIDATION ====================

  /**
   * Validate a reading (approve or reject).
   * 
   * Backend: POST /hyflo/api/flow/core/monitoring/readings/validate
   * 
   * @param request - Reading validation request
   * @returns Success (void)
   */
  static async validateReading(
    request: ReadingValidationRequestDTO
  ): Promise<void> {
    try {
      // Validate rejection reason
      if (request.action === 'REJECT' && !request.comments) {
        throw new Error('Rejection reason is required');
      }

      await axiosInstance.post(
        `${this.BASE_PATH}/readings/validate`,
        request
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        `Failed to ${request.action.toLowerCase()} reading`
      );
    }
  }
}

export default FlowMonitoringService;
