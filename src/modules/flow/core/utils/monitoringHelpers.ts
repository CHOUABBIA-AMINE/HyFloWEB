/**
 * Monitoring Helpers
 * 
 * Utility functions for flow monitoring operations.
 * Updated to work with nested DTO structure.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Updated for nested DTO support
 * @updated 2026-02-04 - Fixed PipelineDTO field access
 * @package flow/core/utils
 */

import { PipelineCoverageDTO } from '../dto/PipelineCoverageDTO';
import { SlotCoverageResponseDTO } from '../dto/SlotCoverageResponseDTO';
import { getLocalizedDesignation } from '../../common/dto/ReadingSlotDTO';

/**
 * Get status color for UI display based on validation status.
 * 
 * @param pipeline - Pipeline coverage with nested validationStatus
 * @returns MUI color
 */
export const getStatusColor = (
  pipeline: PipelineCoverageDTO
): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' => {
  // If no validation status, check if reading exists
  if (!pipeline.validationStatus) {
    return pipeline.readingId ? 'info' : 'default';
  }

  const statusCode = pipeline.validationStatus.code;
  
  const colorMap: Record<string, 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error'> = {
    'NOT_RECORDED': 'default',
    'DRAFT': 'info',
    'SUBMITTED': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'error',
  };
  
  return colorMap[statusCode] || 'default';
};

/**
 * Get status label for display (localized).
 * 
 * @param pipeline - Pipeline coverage with nested validationStatus
 * @param lang - Language (en, fr, ar)
 * @returns Localized status label
 */
export const getStatusLabel = (
  pipeline: PipelineCoverageDTO,
  lang: 'en' | 'fr' | 'ar' = 'en'
): string => {
  if (!pipeline.validationStatus) {
    const fallbackLabels = {
      en: pipeline.readingId ? 'Draft' : 'Not Recorded',
      fr: pipeline.readingId ? 'Brouillon' : 'Non enregistré',
      ar: pipeline.readingId ? 'مسودة' : 'غير مسجل',
    };
    return fallbackLabels[lang];
  }

  const status = pipeline.validationStatus;
  
  // Use designations from ValidationStatusDTO
  switch (lang) {
    case 'ar':
      return status.designationAr || status.designationFr || status.code;
    case 'en':
      return status.designationEn || status.designationFr || status.code;
    case 'fr':
    default:
      return status.designationFr || status.code;
  }
};

/**
 * Format completion percentage for display.
 * 
 * @param percentage - Completion percentage (0-100)
 * @returns Formatted string
 */
export const formatCompletionPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};

/**
 * Format slot time range for display.
 * 
 * @param startTime - Start time (HH:mm:ss)
 * @param endTime - End time (HH:mm:ss)
 * @returns Formatted time range
 */
export const formatSlotTimeRange = (startTime: string, endTime: string): string => {
  // Extract HH:mm from HH:mm:ss
  const formatTime = (time: string) => time.substring(0, 5);
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Calculate completion rate from summary.
 * Uses validationCompletionPercentage if available, otherwise falls back to recording.
 * 
 * @param summary - Coverage response
 * @returns Completion percentage (0-100)
 */
export const calculateCompletionRate = (summary: SlotCoverageResponseDTO): number => {
  // Prefer validation completion percentage
  if (summary.validationCompletionPercentage !== undefined) {
    return Math.round(summary.validationCompletionPercentage);
  }
  
  // Fallback to recording completion
  if (summary.recordingCompletionPercentage !== undefined) {
    return Math.round(summary.recordingCompletionPercentage);
  }
  
  // Calculate manually if not provided
  if (summary.totalPipelines === 0) return 0;
  
  const completed = summary.approvedCount + summary.rejectedCount;
  return Math.round((completed / summary.totalPipelines) * 100);
};

/**
 * Get workflow status priority for sorting.
 * Uses validation status code.
 * 
 * @param pipeline - Pipeline coverage
 * @returns Priority number (lower = higher priority)
 */
export const getStatusPriority = (pipeline: PipelineCoverageDTO): number => {
  const statusCode = pipeline.validationStatus?.code || 'NOT_RECORDED';
  
  const priorities: Record<string, number> = {
    'NOT_RECORDED': 1,  // Highest priority (needs recording)
    'REJECTED': 2,      // Needs correction
    'DRAFT': 3,         // Needs submission
    'SUBMITTED': 4,     // Needs validation
    'APPROVED': 5,      // Completed
  };
  
  return priorities[statusCode] || 999;
};

/**
 * Sort pipelines by status priority.
 * 
 * @param pipelines - Array of pipeline coverage
 * @returns Sorted array (high priority first)
 */
export const sortPipelinesByPriority = (
  pipelines: PipelineCoverageDTO[]
): PipelineCoverageDTO[] => {
  return [...pipelines].sort((a, b) => {
    const priorityDiff = getStatusPriority(a) - getStatusPriority(b);
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Secondary sort by pipeline code
    const codeA = a.pipeline?.code || '';
    const codeB = b.pipeline?.code || '';
    return codeA.localeCompare(codeB);
  });
};

/**
 * Filter pipelines by status code.
 * 
 * @param pipelines - Array of pipeline coverage
 * @param statusCodes - Status codes to filter by
 * @returns Filtered array
 */
export const filterPipelinesByStatus = (
  pipelines: PipelineCoverageDTO[],
  statusCodes: string[]
): PipelineCoverageDTO[] => {
  return pipelines.filter(p => {
    const code = p.validationStatus?.code || 'NOT_RECORDED';
    return statusCodes.includes(code);
  });
};

/**
 * Get pipelines requiring attention.
 * 
 * @param pipelines - Array of pipeline coverage
 * @returns Pipelines needing action
 */
export const getPipelinesRequiringAttention = (
  pipelines: PipelineCoverageDTO[]
): PipelineCoverageDTO[] => {
  return pipelines.filter(p => {
    const statusCode = p.validationStatus?.code || 'NOT_RECORDED';
    return (
      statusCode === 'NOT_RECORDED' ||
      statusCode === 'DRAFT' ||
      statusCode === 'REJECTED' ||
      p.isOverdue === true
    );
  });
};

/**
 * Get pipelines pending validation.
 * 
 * @param pipelines - Array of pipeline coverage
 * @returns Pipelines awaiting validation
 */
export const getPipelinesPendingValidation = (
  pipelines: PipelineCoverageDTO[]
): PipelineCoverageDTO[] => {
  return pipelines.filter(p => p.validationStatus?.code === 'SUBMITTED');
};

/**
 * Check if slot is overdue.
 * 
 * @param slotDeadline - Slot deadline (ISO 8601)
 * @returns True if current time is past slot deadline
 */
export const isSlotOverdue = (slotDeadline?: string): boolean => {
  if (!slotDeadline) return false;
  const now = new Date();
  const deadline = new Date(slotDeadline);
  return now > deadline;
};

/**
 * Get time remaining until slot deadline.
 * 
 * @param slotDeadline - Slot deadline (ISO 8601)
 * @returns Time remaining in minutes (negative if overdue)
 */
export const getTimeRemainingMinutes = (slotDeadline?: string): number => {
  if (!slotDeadline) return 0;
  const now = new Date();
  const deadline = new Date(slotDeadline);
  const diffMs = deadline.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60));
};

/**
 * Format time remaining for display.
 * 
 * @param minutes - Minutes remaining
 * @returns Formatted string
 */
export const formatTimeRemaining = (minutes: number): string => {
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
};

/**
 * Get pipeline display name.
 * PipelineDTO only has 'name' field (not multilingual), so we just return it.
 * 
 * @param pipeline - Pipeline coverage
 * @param lang - Language (ignored for PipelineDTO as it doesn't have multilingual fields)
 * @returns Pipeline name
 */
export const getPipelineDisplayName = (
  pipeline: PipelineCoverageDTO,
  lang?: 'en' | 'fr' | 'ar'
): string => {
  if (!pipeline.pipeline) return `Pipeline ${pipeline.pipelineId}`;
  
  // PipelineDTO only has 'name' and 'code' fields (not multilingual designations)
  return pipeline.pipeline.name || pipeline.pipeline.code;
};

/**
 * Get employee display name.
 * 
 * @param employee - Employee DTO
 * @returns Full name
 */
export const getEmployeeDisplayName = (employee?: { firstNameLt: string; lastNameLt: string }): string => {
  if (!employee) return '-';
  return `${employee.firstNameLt} ${employee.lastNameLt}`;
};
