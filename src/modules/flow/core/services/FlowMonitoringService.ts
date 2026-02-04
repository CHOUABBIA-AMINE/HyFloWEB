/**
 * Flow Monitoring Service
 * 
 * Service for slot-centric flow monitoring APIs.
 * Aligns with backend /flow/core/monitoring endpoints.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Fixed API client import path
 * @updated 2026-02-04 - Fixed duplicate /hyflo/api in BASE_PATH
 * @updated 2026-02-04 - Corrected to /flow/core/monitoring
 * @module flow/core/services
 */

import axiosInstance from '@/shared/config/axios';

// ==================== TYPE DEFINITIONS ====================

/**
 * Slot Coverage Request DTO
 * Matches backend SlotCoverageRequestDTO
 */
export interface SlotCoverageRequestDTO {
  readingDate: string; // YYYY-MM-DD format
  slotId: number;
  structureId: number;
}

/**
 * Slot Coverage Response DTO
 * Matches backend SlotCoverageResponseDTO
 */
export interface SlotCoverageResponseDTO {
  readingDate: string;
  slot: ReadingSlotDTO;
  structure: StructureDTO;
  
  totalPipelines: number;
  recordedCount: number;
  submittedCount: number;
  approvedCount: number;
  rejectedCount: number;
  missingCount: number;
  
  completionPercentage: number;
  isSlotComplete: boolean;
  
  pipelines: PipelineCoverageDTO[];
}

/**
 * Pipeline Coverage DTO
 * Matches backend PipelineCoverageDTO
 */
export interface PipelineCoverageDTO {
  pipelineId: number;
  pipelineCode: string;
  pipelineName: string;
  
  readingId: number | null;
  workflowStatus: WorkflowStatus;
  workflowStatusDisplay: string;
  recordedAt: string | null;
  validatedAt: string | null;
  
  recordedByName: string | null;
  validatedByName: string | null;
  
  availableActions: string[];
  
  canEdit: boolean;
  canSubmit: boolean;
  canValidate: boolean;
  isOverdue: boolean;
}

/**
 * Reading Slot DTO
 */
export interface ReadingSlotDTO {
  id: number;
  slotNumber: number;
  slotName: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
}

/**
 * Structure DTO
 */
export interface StructureDTO {
  id: number;
  code: string;
  name: string;
}

/**
 * Reading Submit Request DTO
 * Matches backend ReadingSubmitRequestDTO
 */
export interface ReadingSubmitRequestDTO {
  readingId: number | null; // null for new reading
  pipelineId: number;
  readingDate: string;
  slotId: number;
  employeeId: number;
  pressure: number;
  temperature: number;
  flowRate: number;
  containedVolume?: number;
  notes?: string;
  submitImmediately: boolean; // true = SUBMITTED, false = DRAFT
}

/**
 * Reading Validation Request DTO
 * Matches backend ReadingValidationRequestDTO
 */
export interface ReadingValidationRequestDTO {
  readingId: number;
  action: 'APPROVE' | 'REJECT';
  employeeId: number;
  comments?: string; // Required if REJECT
}

/**
 * Workflow Status enum
 */
export type WorkflowStatus = 
  | 'NOT_RECORDED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

// ==================== SERVICE CLASS ====================

/**
 * FlowMonitoringService
 * 
 * Provides slot-centric monitoring operations aligned with backend API.
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

  // ==================== UTILITY METHODS ====================

  /**
   * Get status color for UI display.
   * 
   * @param status - Workflow status
   * @returns MUI color
   */
  static getStatusColor(
    status: WorkflowStatus
  ): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' {
    const colorMap: Record<WorkflowStatus, 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error'> = {
      NOT_RECORDED: 'default',
      DRAFT: 'info',
      SUBMITTED: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
    };
    return colorMap[status] || 'default';
  }

  /**
   * Get status label for display.
   * 
   * @param status - Workflow status
   * @param lang - Language (en, fr, ar)
   * @returns Localized status label
   */
  static getStatusLabel(
    status: WorkflowStatus,
    lang: 'en' | 'fr' | 'ar' = 'en'
  ): string {
    const labels: Record<WorkflowStatus, Record<string, string>> = {
      NOT_RECORDED: {
        en: 'Not Recorded',
        fr: 'Non enregistré',
        ar: 'غير مسجل',
      },
      DRAFT: {
        en: 'Draft',
        fr: 'Brouillon',
        ar: 'مسودة',
      },
      SUBMITTED: {
        en: 'Submitted',
        fr: 'Soumis',
        ar: 'مقدم',
      },
      APPROVED: {
        en: 'Approved',
        fr: 'Approuvé',
        ar: 'موافق عليه',
      },
      REJECTED: {
        en: 'Rejected',
        fr: 'Rejeté',
        ar: 'مرفوض',
      },
    };
    return labels[status]?.[lang] || status;
  }

  /**
   * Format completion percentage for display.
   * 
   * @param percentage - Completion percentage (0-100)
   * @returns Formatted string
   */
  static formatCompletionPercentage(percentage: number): string {
    return `${Math.round(percentage)}%`;
  }

  /**
   * Format slot time range for display.
   * 
   * @param startTime - Start time (HH:mm:ss)
   * @param endTime - End time (HH:mm:ss)
   * @returns Formatted time range
   */
  static formatSlotTimeRange(startTime: string, endTime: string): string {
    // Extract HH:mm from HH:mm:ss
    const formatTime = (time: string) => time.substring(0, 5);
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  /**
   * Calculate completion rate from summary.
   * 
   * @param summary - Coverage response
   * @returns Completion percentage (0-100)
   */
  static calculateCompletionRate(summary: SlotCoverageResponseDTO): number {
    if (summary.totalPipelines === 0) return 0;
    
    const completed = summary.approvedCount + summary.submittedCount;
    return Math.round((completed / summary.totalPipelines) * 100);
  }

  /**
   * Check if pipeline can be edited.
   * 
   * @param pipeline - Pipeline coverage
   * @returns True if editable
   */
  static canEditPipeline(pipeline: PipelineCoverageDTO): boolean {
    return pipeline.canEdit && 
           (pipeline.workflowStatus === 'NOT_RECORDED' || 
            pipeline.workflowStatus === 'DRAFT' ||
            pipeline.workflowStatus === 'REJECTED');
  }

  /**
   * Check if pipeline can be submitted.
   * 
   * @param pipeline - Pipeline coverage
   * @returns True if submittable
   */
  static canSubmitPipeline(pipeline: PipelineCoverageDTO): boolean {
    return pipeline.canSubmit && pipeline.workflowStatus === 'DRAFT';
  }

  /**
   * Check if pipeline can be validated.
   * 
   * @param pipeline - Pipeline coverage
   * @returns True if validatable
   */
  static canValidatePipeline(pipeline: PipelineCoverageDTO): boolean {
    return pipeline.canValidate && pipeline.workflowStatus === 'SUBMITTED';
  }

  /**
   * Get available actions for pipeline.
   * 
   * @param pipeline - Pipeline coverage
   * @returns Array of action strings
   */
  static getAvailableActions(pipeline: PipelineCoverageDTO): string[] {
    const actions: string[] = [];

    if (this.canEditPipeline(pipeline)) {
      actions.push('EDIT');
    }

    if (this.canSubmitPipeline(pipeline)) {
      actions.push('SUBMIT');
    }

    if (this.canValidatePipeline(pipeline)) {
      actions.push('APPROVE', 'REJECT');
    }

    return actions;
  }

  /**
   * Get workflow status priority for sorting.
   * 
   * @param status - Workflow status
   * @returns Priority number (lower = higher priority)
   */
  static getStatusPriority(status: WorkflowStatus): number {
    const priorities: Record<WorkflowStatus, number> = {
      NOT_RECORDED: 1,  // Highest priority (needs recording)
      REJECTED: 2,      // Needs correction
      DRAFT: 3,         // Needs submission
      SUBMITTED: 4,     // Needs validation
      APPROVED: 5,      // Completed
    };
    return priorities[status] || 999;
  }

  /**
   * Sort pipelines by status priority.
   * 
   * @param pipelines - Array of pipeline coverage
   * @returns Sorted array (high priority first)
   */
  static sortPipelinesByPriority(
    pipelines: PipelineCoverageDTO[]
  ): PipelineCoverageDTO[] {
    return [...pipelines].sort((a, b) => {
      const priorityDiff = 
        this.getStatusPriority(a.workflowStatus) - 
        this.getStatusPriority(b.workflowStatus);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary sort by pipeline code
      return a.pipelineCode.localeCompare(b.pipelineCode);
    });
  }

  /**
   * Filter pipelines by status.
   * 
   * @param pipelines - Array of pipeline coverage
   * @param statuses - Statuses to filter by
   * @returns Filtered array
   */
  static filterPipelinesByStatus(
    pipelines: PipelineCoverageDTO[],
    statuses: WorkflowStatus[]
  ): PipelineCoverageDTO[] {
    return pipelines.filter(p => statuses.includes(p.workflowStatus));
  }

  /**
   * Get pipelines requiring attention.
   * 
   * @param pipelines - Array of pipeline coverage
   * @returns Pipelines needing action
   */
  static getPipelinesRequiringAttention(
    pipelines: PipelineCoverageDTO[]
  ): PipelineCoverageDTO[] {
    return pipelines.filter(p => 
      p.workflowStatus === 'NOT_RECORDED' ||
      p.workflowStatus === 'DRAFT' ||
      p.workflowStatus === 'REJECTED' ||
      p.isOverdue
    );
  }

  /**
   * Get pipelines pending validation.
   * 
   * @param pipelines - Array of pipeline coverage
   * @returns Pipelines awaiting validation
   */
  static getPipelinesPendingValidation(
    pipelines: PipelineCoverageDTO[]
  ): PipelineCoverageDTO[] {
    return pipelines.filter(p => p.workflowStatus === 'SUBMITTED');
  }

  /**
   * Check if slot is overdue.
   * 
   * @param slotEndTime - Slot end time (HH:mm:ss)
   * @param slotDate - Slot date (YYYY-MM-DD)
   * @returns True if current time is past slot end
   */
  static isSlotOverdue(slotEndTime: string, slotDate: string): boolean {
    const now = new Date();
    const slotDateTime = new Date(`${slotDate}T${slotEndTime}`);
    return now > slotDateTime;
  }

  /**
   * Get time remaining until slot deadline.
   * 
   * @param slotEndTime - Slot end time (HH:mm:ss)
   * @param slotDate - Slot date (YYYY-MM-DD)
   * @returns Time remaining in minutes (negative if overdue)
   */
  static getTimeRemainingMinutes(
    slotEndTime: string,
    slotDate: string
  ): number {
    const now = new Date();
    const slotDateTime = new Date(`${slotDate}T${slotEndTime}`);
    const diffMs = slotDateTime.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Format time remaining for display.
   * 
   * @param minutes - Minutes remaining
   * @returns Formatted string
   */
  static formatTimeRemaining(minutes: number): string {
    if (minutes < 0) {
      const absMinutes = Math.abs(minutes);
      const hours = Math.floor(absMinutes / 60);
      const mins = absMinutes % 60;
      return hours > 0 
        ? `Overdue by ${hours}h ${mins}m`
        : `Overdue by ${mins}m`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m remaining`;
    }
    return `${mins}m remaining`;
  }

  /**
   * Validate reading submit request.
   * 
   * @param request - Reading submit request
   * @returns Validation result with errors
   */
  static validateSubmitRequest(request: ReadingSubmitRequestDTO): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.pipelineId) {
      errors.push('Pipeline is required');
    }

    if (!request.readingDate) {
      errors.push('Reading date is required');
    }

    if (!request.slotId) {
      errors.push('Slot is required');
    }

    if (!request.employeeId) {
      errors.push('Employee is required');
    }

    if (request.pressure == null) {
      errors.push('Pressure is required');
    } else if (request.pressure < 0) {
      errors.push('Pressure must be positive');
    }

    if (request.temperature == null) {
      errors.push('Temperature is required');
    }

    if (request.flowRate == null) {
      errors.push('Flow rate is required');
    } else if (request.flowRate < 0) {
      errors.push('Flow rate must be positive');
    }

    if (request.containedVolume != null && request.containedVolume < 0) {
      errors.push('Contained volume must be positive');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default FlowMonitoringService;
