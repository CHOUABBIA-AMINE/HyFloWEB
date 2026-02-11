/**
 * Slot Coverage Service
 * 
 * Provides slot-centric monitoring APIs for SONATRACH operational workflow.
 * Handles date + slot + structure filtering and reading lifecycle management.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-03
 * @updated 2026-02-11 14:45 - Fixed: Use correct '/flow/core/slot-coverage' endpoint
 * @updated 2026-02-04 - Fixed API client import path
 * @module flow/core/services
 */

import axiosInstance from '@/shared/config/axios';
import type { 
  SlotCoverageDTO, 
  PipelineCoverageItemDTO,
  CoverageSummaryDTO,
  SlotCoverageFilters,
  BulkActionResult,
  DailyCoverageSummaryDTO,
  SlotCompletionStatsDTO,
  ReadingStatus,
} from '../dto/SlotCoverageDTO';
import type { FlowReadingDTO } from '../dto/FlowReadingDTO';
import type { StructureDTO } from '@/modules/general/organization/dto/StructureDTO';
import type { Page, Pageable } from '@/types/pagination';

/**
 * SlotCoverageService
 * 
 * PRIMARY service for operational console.
 * All slot-based monitoring should use this service.
 */
export class SlotCoverageService {
  
  // ==================== SLOT COVERAGE APIs ====================
  
  /**
   * Get complete slot coverage for a specific date, slot, and structure.
   * 
   * This is the MAIN API for the operational dashboard.
   * Returns all pipelines managed by the structure with their reading status.
   * 
   * @param date - Business date (YYYY-MM-DD format)
   * @param slotNumber - Slot number (1-12)
   * @param structureId - Structure/organization unit ID
   * @returns Complete slot coverage with permissions
   * 
   * @example
   * ```typescript
   * const coverage = await SlotCoverageService.getSlotCoverage(
   *   '2026-02-03',
   *   5,
   *   12
   * );
   * 
   * // coverage.pipelineCoverage contains all pipelines with:
   * // - status: NOT_RECORDED | DRAFT | SUBMITTED | APPROVED | REJECTED
   * // - reading: null or FlowReadingDTO
   * // - canCreate, canEdit, canSubmit, canApprove, canReject (permissions)
   * ```
   */
  static async getSlotCoverage(
    date: string,
    slotNumber: number,
    structureId: number
  ): Promise<SlotCoverageDTO> {
    try {
      // ✅ FIXED: Use '/flow/core/slot-coverage' to avoid conflict with '/flow/core/reading/{id}'
      const response = await axiosInstance.get<SlotCoverageDTO>('/flow/core/slot-coverage', {
        params: {
          date,
          slotNumber,
          structureId,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        `Failed to load slot coverage for ${date}, slot ${slotNumber}`
      );
    }
  }

  /**
   * Get slot coverage with additional filtering options.
   * Allows filtering by pipeline status, product type, etc.
   * 
   * @param filters - Advanced filtering criteria
   * @returns Filtered slot coverage
   */
  static async getSlotCoverageFiltered(
    filters: SlotCoverageFilters
  ): Promise<SlotCoverageDTO> {
    try {
      const response = await axiosInstance.get<SlotCoverageDTO>('/flow/core/slot-coverage/filtered', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to load filtered slot coverage'
      );
    }
  }

  /**
   * Get coverage summary for all 12 slots (entire day view).
   * Useful for dashboards showing slot completion over time.
   * 
   * @param date - Business date
   * @param structureId - Structure ID
   * @returns Daily coverage with all slot summaries
   */
  static async getDailyCoverageSummary(
    date: string,
    structureId: number
  ): Promise<DailyCoverageSummaryDTO> {
    try {
      const response = await axiosInstance.get<DailyCoverageSummaryDTO>('/flow/core/slot-coverage/daily-summary', {
        params: { date, structureId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to load daily coverage summary'
      );
    }
  }

  // ==================== READING LIFECYCLE APIs ====================

  /**
   * Create a new reading for a specific pipeline in a slot.
   * 
   * Status: NOT_RECORDED → DRAFT
   * 
   * @param data - Reading data with required slot context
   * @returns Created reading with DRAFT status
   * 
   * @example
   * ```typescript
   * const reading = await SlotCoverageService.createSlotReading({
   *   pipelineId: 101,
   *   readingSlotId: 5,
   *   readingDate: '2026-02-03',
   *   pressure: 85.5,
   *   temperature: 45.2,
   *   flowRate: 1250.0,
   *   notes: 'Normal operation',
   * });
   * ```
   */
  static async createSlotReading(
    data: Partial<FlowReadingDTO>
  ): Promise<FlowReadingDTO> {
    try {
      // Validate required slot fields
      if (!data.readingDate) {
        throw new Error('Reading date is required');
      }
      if (!data.readingSlotId) {
        throw new Error('Reading slot is required');
      }
      if (!data.pipelineId) {
        throw new Error('Pipeline is required');
      }

      const response = await axiosInstance.post<FlowReadingDTO>('/flow/core/reading', data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to create reading'
      );
    }
  }

  /**
   * Update an existing reading (only allowed in DRAFT or REJECTED status).
   * 
   * @param readingId - Reading ID
   * @param data - Updated reading data
   * @returns Updated reading
   */
  static async updateSlotReading(
    readingId: number,
    data: Partial<FlowReadingDTO>
  ): Promise<FlowReadingDTO> {
    try {
      const response = await axiosInstance.put<FlowReadingDTO>(
        `/flow/core/reading/${readingId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to update reading'
      );
    }
  }

  /**
   * Submit reading for validation.
   * 
   * Status transition: DRAFT → SUBMITTED
   * 
   * Only the operator who created the reading can submit it.
   * 
   * @param readingId - Reading ID
   * @returns Reading with SUBMITTED status
   */
  static async submitReading(readingId: number): Promise<FlowReadingDTO> {
    try {
      const response = await axiosInstance.post<FlowReadingDTO>(
        `/flow/core/reading/${readingId}/submit`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to submit reading for validation'
      );
    }
  }

  /**
   * Approve a submitted reading.
   * 
   * Status transition: SUBMITTED → APPROVED
   * 
   * Only validators with appropriate permissions can approve.
   * 
   * @param readingId - Reading ID
   * @param notes - Optional validation notes
   * @returns Reading with APPROVED status
   */
  static async approveReading(
    readingId: number,
    notes?: string
  ): Promise<FlowReadingDTO> {
    try {
      const response = await axiosInstance.post<FlowReadingDTO>(
        `/flow/core/reading/${readingId}/approve`,
        { notes }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to approve reading'
      );
    }
  }

  /**
   * Reject a submitted reading.
   * 
   * Status transition: SUBMITTED → REJECTED
   * 
   * Only validators can reject. Rejection reason is REQUIRED.
   * Rejected readings can be edited and resubmitted by operators.
   * 
   * @param readingId - Reading ID
   * @param reason - Rejection reason (required)
   * @returns Reading with REJECTED status
   */
  static async rejectReading(
    readingId: number,
    reason: string
  ): Promise<FlowReadingDTO> {
    try {
      if (!reason || reason.trim().length === 0) {
        throw new Error('Rejection reason is required');
      }

      const response = await axiosInstance.post<FlowReadingDTO>(
        `/flow/core/reading/${readingId}/reject`,
        { reason }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to reject reading'
      );
    }
  }

  /**
   * Recall a submitted reading back to draft (before validation).
   * 
   * Status transition: SUBMITTED → DRAFT
   * 
   * Allows operators to cancel submission if they notice an error.
   * 
   * @param readingId - Reading ID
   * @returns Reading with DRAFT status
   */
  static async recallReading(readingId: number): Promise<FlowReadingDTO> {
    try {
      const response = await axiosInstance.post<FlowReadingDTO>(
        `/flow/core/reading/${readingId}/recall`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to recall reading'
      );
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Submit multiple readings for validation at once.
   * Useful for slot completion workflows.
   * 
   * @param readingIds - Array of reading IDs
   * @returns Bulk operation result with success/failure counts
   */
  static async submitMultipleReadings(
    readingIds: number[]
  ): Promise<BulkActionResult> {
    try {
      const response = await axiosInstance.post<BulkActionResult>(
        '/flow/core/reading/bulk/submit',
        { readingIds }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to submit multiple readings'
      );
    }
  }

  /**
   * Approve multiple submitted readings at once (validator only).
   * 
   * @param readingIds - Array of reading IDs
   * @param notes - Optional notes applied to all
   * @returns Bulk operation result
   */
  static async approveMultipleReadings(
    readingIds: number[],
    notes?: string
  ): Promise<BulkActionResult> {
    try {
      const response = await axiosInstance.post<BulkActionResult>(
        '/flow/core/reading/bulk/approve',
        { readingIds, notes }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to approve multiple readings'
      );
    }
  }

  /**
   * Approve all submitted readings for a specific slot (validator only).
   * 
   * @param date - Business date
   * @param slotNumber - Slot number (1-12)
   * @param structureId - Structure ID
   * @param notes - Optional validation notes
   * @returns Bulk operation result
   */
  static async approveAllSlotReadings(
    date: string,
    slotNumber: number,
    structureId: number,
    notes?: string
  ): Promise<BulkActionResult> {
    try {
      const response = await axiosInstance.post<BulkActionResult>(
        '/flow/core/slot-coverage/bulk-approve',
        { date, slotNumber, structureId, notes }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to approve all slot readings'
      );
    }
  }

  // ==================== USER CONTEXT APIs ====================

  /**
   * Get structures accessible by the current user.
   * Returns only structures the user has permission to manage.
   * 
   * Backend filters based on user's role and assignments.
   * 
   * @returns Array of authorized structures
   */
  static async getUserStructures(): Promise<StructureDTO[]> {
    try {
      const response = await axiosInstance.get<StructureDTO[]>(
        '/flow/core/slot-coverage/user-structures'
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to load user structures'
      );
    }
  }

  /**
   * Get current user's active slot context.
   * Returns the slot the user is currently assigned to based on time/shift.
   * 
   * @returns Current slot context or null if not in shift
   */
  static async getCurrentSlotContext(): Promise<{
    date: string;
    slot: number;
    structure: StructureDTO;
  } | null> {
    try {
      const response = await axiosInstance.get(
        '/flow/core/slot-coverage/current-context'
      );
      return response.data;
    } catch (error: any) {
      // Return null if user is not in an active shift
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(
        error.response?.data?.message || 
        'Failed to load current slot context'
      );
    }
  }

  /**
   * Get user's pending actions (readings requiring their attention).
   * 
   * For operators: DRAFT or REJECTED readings they need to complete/fix
   * For validators: SUBMITTED readings awaiting their validation
   * 
   * @param pageable - Pagination parameters
   * @returns Paginated list of readings requiring attention
   */
  static async getUserPendingActions(
    pageable?: Pageable
  ): Promise<Page<FlowReadingDTO>> {
    try {
      const response = await axiosInstance.get<Page<FlowReadingDTO>>(
        '/flow/core/slot-coverage/pending-actions',
        { params: pageable }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to load pending actions'
      );
    }
  }

  // ==================== ANALYTICS & REPORTING ====================

  /**
   * Get slot completion statistics for a date range.
   * 
   * @param startDate - Start date (inclusive)
   * @param endDate - End date (inclusive)
   * @param structureId - Structure ID
   * @returns Completion statistics by slot
   */
  static async getSlotCompletionStats(
    startDate: string,
    endDate: string,
    structureId: number
  ): Promise<SlotCompletionStatsDTO[]> {
    try {
      const response = await axiosInstance.get<SlotCompletionStatsDTO[]>(
        '/flow/core/slot-coverage/stats',
        { params: { startDate, endDate, structureId } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to load slot completion statistics'
      );
    }
  }

  /**
   * Export slot coverage to Excel.
   * 
   * @param date - Business date
   * @param slotNumber - Slot number
   * @param structureId - Structure ID
   * @returns Blob containing Excel file
   */
  static async exportSlotCoverage(
    date: string,
    slotNumber: number,
    structureId: number
  ): Promise<Blob> {
    try {
      const response = await axiosInstance.get(
        '/flow/core/slot-coverage/export',
        {
          params: { date, slotNumber, structureId },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to export slot coverage');
    }
  }

  /**
   * Download exported coverage file.
   * Helper method to trigger browser download.
   * 
   * @param blob - Excel blob from exportSlotCoverage
   * @param filename - File name for download
   */
  static downloadCoverageExport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // ==================== VALIDATION & HELPERS ====================

  /**
   * Check if a reading can be submitted.
   * 
   * @param reading - Reading to check
   * @returns Validation result with errors if any
   */
  static canSubmitReading(reading: FlowReadingDTO): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Must have at least one measurement
    if (
      reading.pressure == null &&
      reading.temperature == null &&
      reading.flowRate == null &&
      reading.containedVolume == null
    ) {
      errors.push('At least one measurement is required');
    }

    // Must be in DRAFT status
    if (reading.validationStatus?.code !== 'DRAFT') {
      errors.push('Only draft readings can be submitted');
    }

    // Must have recorded by
    if (!reading.recordedById) {
      errors.push('Recorded by is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate slot completion percentage.
   * 
   * @param summary - Coverage summary
   * @returns Completion percentage (0-100)
   */
  static calculateCompletionRate(summary: CoverageSummaryDTO): number {
    if (summary.totalPipelines === 0) return 0;
    
    const completed = summary.approved + summary.submitted;
    return Math.round((completed / summary.totalPipelines) * 100);
  }

  /**
   * Get status color for UI display.
   * 
   * @param status - Reading status
   * @returns MUI color
   */
  static getStatusColor(status: ReadingStatus): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' {
    const colorMap: Record<ReadingStatus, 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error'> = {
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
   * @param status - Reading status
   * @param lang - Language (en, fr, ar)
   * @returns Localized status label
   */
  static getStatusLabel(status: ReadingStatus, lang: 'en' | 'fr' | 'ar' = 'en'): string {
    const labels: Record<ReadingStatus, Record<string, string>> = {
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
}

export default SlotCoverageService;
