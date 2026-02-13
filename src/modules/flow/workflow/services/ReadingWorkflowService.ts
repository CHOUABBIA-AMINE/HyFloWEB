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
 * @updated 2026-02-14 00:50 - Deep log error.response.data to show nested backend errors
 * @updated 2026-02-14 00:48 - Improved error logging to show actual backend error details
 * @updated 2026-02-14 00:43 - Fixed: Backend endpoint is /flow/workflow/reading (not /flow/core/workflow/readings)
 * @package flow/workflow/services
 */

import axiosInstance from '@/shared/config/axios';
import type { FlowReadingDTO } from '../../core/dto/FlowReadingDTO';

// ✅ FIXED: Backend path is /flow/workflow/reading (singular, no 'core')
const BASE_URL = '/flow/workflow/reading';

export class ReadingWorkflowService {
  
  /**
   * Validate a submitted reading
   * 
   * Endpoint: POST /flow/workflow/reading/{id}/validate?validatedById={employeeId}
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
      console.log('🔄 Validating reading:', { id, validatedById });
      
      const response = await axiosInstance.post<FlowReadingDTO>(
        `${BASE_URL}/${id}/validate`,
        null, // No request body
        {
          params: { validatedById },
        }
      );
      
      console.log('✅ Reading validated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // ✅ IMPROVED: Separate logging for better visibility
      console.error('❌ Validation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
      
      // Log response data separately so it's not collapsed
      if (error.response?.data) {
        console.error('📦 Backend error details:', error.response.data);
      }
      
      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Extract error message from various possible formats
        let message = 'An unexpected error occurred';
        
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.error) {
          message = errorData.error;
        } else if (errorData?.details) {
          message = errorData.details;
        } else if (errorData?.trace) {
          // Java stack trace might be in 'trace' field
          message = `Backend exception: ${errorData.trace.split('\n')[0]}`;
        }
        
        // Include validation errors if present
        if (errorData?.validationErrors) {
          const validationErrors = Object.entries(errorData.validationErrors)
            .map(([field, error]) => `${field}: ${error}`)
            .join(', ');
          message = `${message}. Validation errors: ${validationErrors}`;
        }
        
        switch (status) {
          case 400:
            throw new Error(`Validation failed (400): ${message}`);
          case 404:
            throw new Error(`Not found (404): ${message}`);
          case 409:
            throw new Error(`Cannot validate (409): ${message}`);
          case 500:
            throw new Error(`Server error (500): ${message}`);
          default:
            throw new Error(`Validation error (${status}): ${message}`);
        }
      }
      
      // Network or other error
      throw new Error(`Network error: ${error.message || 'Unable to connect to server'}`);
    }
  }
  
  /**
   * Reject a submitted reading
   * 
   * Endpoint: POST /flow/workflow/reading/{id}/reject?rejectedById={employeeId}&rejectionReason={reason}
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
      console.log('🔄 Rejecting reading:', { id, rejectedById, reason: rejectionReason.trim() });
      
      const response = await axiosInstance.post<FlowReadingDTO>(
        `${BASE_URL}/${id}/reject`,
        null, // No request body
        {
          params: {
            rejectedById,
            rejectionReason: rejectionReason.trim(),
          },
        }
      );
      
      console.log('✅ Reading rejected successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // ✅ IMPROVED: Separate logging for better visibility
      console.error('❌ Rejection error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
      
      // Log response data separately so it's not collapsed
      if (error.response?.data) {
        console.error('📦 Backend error details:', error.response.data);
      }
      
      // Enhanced error handling
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Extract error message from various possible formats
        let message = 'An unexpected error occurred';
        
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.error) {
          message = errorData.error;
        } else if (errorData?.details) {
          message = errorData.details;
        } else if (errorData?.trace) {
          // Java stack trace might be in 'trace' field
          message = `Backend exception: ${errorData.trace.split('\n')[0]}`;
        }
        
        // Include validation errors if present
        if (errorData?.validationErrors) {
          const validationErrors = Object.entries(errorData.validationErrors)
            .map(([field, error]) => `${field}: ${error}`)
            .join(', ');
          message = `${message}. Validation errors: ${validationErrors}`;
        }
        
        switch (status) {
          case 400:
            throw new Error(`Rejection failed (400): ${message}`);
          case 404:
            throw new Error(`Not found (404): ${message}`);
          case 409:
            throw new Error(`Cannot reject (409): ${message}`);
          case 500:
            throw new Error(`Server error (500): ${message}`);
          default:
            throw new Error(`Rejection error (${status}): ${message}`);
        }
      }
      
      // Network or other error
      throw new Error(`Network error: ${error.message || 'Unable to connect to server'}`);
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
