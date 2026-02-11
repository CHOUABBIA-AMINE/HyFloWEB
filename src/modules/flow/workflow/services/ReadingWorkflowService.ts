/**
 * Reading Workflow Service - Flow Workflow Module
 * 
 * Handles state transitions for flow readings.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.workflow.controller.ReadingWorkflowController
 * 
 * This service handles ONLY workflow state transitions:
 * - Validate readings (SUBMITTED → VALIDATED)
 * - Reject readings (SUBMITTED → REJECTED)
 * 
 * For CRUD operations, use FlowReadingService.
 * For analytics, use FlowMonitoringService.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/workflow/services
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowReadingDTO } from '../../core/dto/FlowReadingDTO';

const BASE_URL = '/flow/core/workflow';  // ✅ Updated path (not /flow/core/reading)

export class ReadingWorkflowService {
  
  /**
   * Validate a submitted reading
   * 
   * Endpoint: POST /flow/core/workflow/readings/{id}/validate?validatedById={employeeId}
   * Workflow: SUBMITTED → VALIDATED
   * 
   * Backend behavior:
   * - Validates reading exists and is in SUBMITTED status
   * - Updates validationStatusId to VALIDATED
   * - Sets validatedById and validatedAt timestamp
   * - Publishes FlowReadingValidatedEvent
   * - Returns updated FlowReadingDTO
   * 
   * @param id - Reading ID to validate
   * @param validatedById - Validator employee ID
   * @returns Updated reading with VALIDATED status
   * 
   * @throws {400} Bad Request - Invalid parameters
   * @throws {404} Not Found - Reading or employee not found
   * @throws {409} Conflict - Invalid state transition (e.g., already validated)
   * 
   * @example
   * ```typescript
   * const validated = await ReadingWorkflowService.validate(123, 456);
   * console.log(validated.validationStatus.code); // "VALIDATED"
   * ```
   */
  static async validate(
    id: number,
    validatedById: number
  ): Promise<FlowReadingDTO> {
    // Validate inputs
    if (!id || id <= 0) {
      throw new Error('Reading ID is required and must be positive');
    }
    
    if (!validatedById || validatedById <= 0) {
      throw new Error('Validator ID is required and must be positive');
    }
    
    try {
      const response = await axiosInstance.post<FlowReadingDTO>(
        `${BASE_URL}/readings/${id}/validate`,
        null, // No request body
        {
          params: { validatedById },
        }
      );
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        
        switch (status) {
          case 400:
            throw new Error(`Validation failed: ${message}`);
          case 404:
            throw new Error('Reading or employee not found');
          case 409:
            throw new Error(`Cannot validate: ${message}`);
          default:
            throw new Error(`Validation error: ${message}`);
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Reject a submitted reading
   * 
   * Endpoint: POST /flow/core/workflow/readings/{id}/reject?rejectedById={employeeId}&rejectionReason={reason}
   * Workflow: SUBMITTED → REJECTED
   * 
   * Backend behavior:
   * - Validates reading exists and is in SUBMITTED status
   * - Updates validationStatusId to REJECTED
   * - Sets validatedById (rejector) and validatedAt timestamp
   * - Appends rejection reason to notes field
   * - Publishes FlowReadingRejectedEvent
   * - Returns updated FlowReadingDTO
   * 
   * @param id - Reading ID to reject
   * @param rejectedById - Rejector employee ID
   * @param rejectionReason - Reason for rejection (required, min 5 chars)
   * @returns Updated reading with REJECTED status
   * 
   * @throws {400} Bad Request - Missing rejection reason or invalid parameters
   * @throws {404} Not Found - Reading or employee not found
   * @throws {409} Conflict - Invalid state transition
   * 
   * @example
   * ```typescript
   * const rejected = await ReadingWorkflowService.reject(
   *   123,
   *   456,
   *   'Pressure value exceeds normal operating range'
   * );
   * console.log(rejected.validationStatus.code); // "REJECTED"
   * console.log(rejected.notes); // Contains rejection reason
   * ```
   */
  static async reject(
    id: number,
    rejectedById: number,
    rejectionReason: string
  ): Promise<FlowReadingDTO> {
    // Validate inputs
    if (!id || id <= 0) {
      throw new Error('Reading ID is required and must be positive');
    }
    
    if (!rejectedById || rejectedById <= 0) {
      throw new Error('Rejector ID is required and must be positive');
    }
    
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }
    
    if (rejectionReason.trim().length < 5) {
      throw new Error('Rejection reason must be at least 5 characters');
    }
    
    try {
      const response = await axiosInstance.post<FlowReadingDTO>(
        `${BASE_URL}/readings/${id}/reject`,
        null, // No request body
        {
          params: {
            rejectedById,
            rejectionReason: rejectionReason.trim(),
          },
        }
      );
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        
        switch (status) {
          case 400:
            throw new Error(`Rejection failed: ${message}`);
          case 404:
            throw new Error('Reading or employee not found');
          case 409:
            throw new Error(`Cannot reject: ${message}`);
          default:
            throw new Error(`Rejection error: ${message}`);
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Batch validate multiple readings
   * 
   * Validates multiple readings in sequence.
   * Note: Backend does not provide a batch endpoint, so this calls validate() for each reading.
   * 
   * @param ids - Array of reading IDs to validate
   * @param validatedById - Validator employee ID
   * @returns Results with successful and failed validations
   * 
   * @example
   * ```typescript
   * const result = await ReadingWorkflowService.batchValidate([123, 124, 125], 456);
   * console.log(`Validated: ${result.successful.length}`);
   * console.log(`Failed: ${result.failed.length}`);
   * ```
   */
  static async batchValidate(
    ids: number[],
    validatedById: number
  ): Promise<{
    successful: FlowReadingDTO[];
    failed: Array<{ id: number; error: string }>;
  }> {
    const successful: FlowReadingDTO[] = [];
    const failed: Array<{ id: number; error: string }> = [];
    
    for (const id of ids) {
      try {
        const result = await this.validate(id, validatedById);
        successful.push(result);
      } catch (error: any) {
        failed.push({
          id,
          error: error.message || 'Unknown error',
        });
      }
    }
    
    return { successful, failed };
  }
  
  /**
   * Batch reject multiple readings
   * 
   * Rejects multiple readings in sequence.
   * Note: Backend does not provide a batch endpoint, so this calls reject() for each reading.
   * 
   * @param ids - Array of reading IDs to reject
   * @param rejectedById - Rejector employee ID
   * @param rejectionReason - Reason for rejection (applies to all)
   * @returns Results with successful and failed rejections
   * 
   * @example
   * ```typescript
   * const result = await ReadingWorkflowService.batchReject(
   *   [123, 124],
   *   456,
   *   'Data integrity issues'
   * );
   * ```
   */
  static async batchReject(
    ids: number[],
    rejectedById: number,
    rejectionReason: string
  ): Promise<{
    successful: FlowReadingDTO[];
    failed: Array<{ id: number; error: string }>;
  }> {
    const successful: FlowReadingDTO[] = [];
    const failed: Array<{ id: number; error: string }> = [];
    
    for (const id of ids) {
      try {
        const result = await this.reject(id, rejectedById, rejectionReason);
        successful.push(result);
      } catch (error: any) {
        failed.push({
          id,
          error: error.message || 'Unknown error',
        });
      }
    }
    
    return { successful, failed };
  }
}

export default ReadingWorkflowService;
