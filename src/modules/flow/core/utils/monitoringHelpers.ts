/**
 * Monitoring Helpers
 * 
 * Utility functions for flow monitoring operations.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/utils
 */

import { WorkflowStatus } from '../types/WorkflowStatus';
import { PipelineCoverageDTO } from '../dto/PipelineCoverageDTO';
import { SlotCoverageResponseDTO } from '../dto/SlotCoverageResponseDTO';

/**
 * Get status color for UI display.
 * 
 * @param status - Workflow status
 * @returns MUI color
 */
export const getStatusColor = (
  status: WorkflowStatus
): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' => {
  const colorMap: Record<WorkflowStatus, 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error'> = {
    NOT_RECORDED: 'default',
    DRAFT: 'info',
    SUBMITTED: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  };
  return colorMap[status] || 'default';
};

/**
 * Get status label for display.
 * 
 * @param status - Workflow status
 * @param lang - Language (en, fr, ar)
 * @returns Localized status label
 */
export const getStatusLabel = (
  status: WorkflowStatus,
  lang: 'en' | 'fr' | 'ar' = 'en'
): string => {
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
 * 
 * @param summary - Coverage response
 * @returns Completion percentage (0-100)
 */
export const calculateCompletionRate = (summary: SlotCoverageResponseDTO): number => {
  if (summary.totalPipelines === 0) return 0;
  
  const completed = summary.approvedCount + summary.submittedCount;
  return Math.round((completed / summary.totalPipelines) * 100);
};

/**
 * Get workflow status priority for sorting.
 * 
 * @param status - Workflow status
 * @returns Priority number (lower = higher priority)
 */
export const getStatusPriority = (status: WorkflowStatus): number => {
  const priorities: Record<WorkflowStatus, number> = {
    NOT_RECORDED: 1,  // Highest priority (needs recording)
    REJECTED: 2,      // Needs correction
    DRAFT: 3,         // Needs submission
    SUBMITTED: 4,     // Needs validation
    APPROVED: 5,      // Completed
  };
  return priorities[status] || 999;
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
    const priorityDiff = 
      getStatusPriority(a.workflowStatus) - 
      getStatusPriority(b.workflowStatus);
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Secondary sort by pipeline code
    return a.pipelineCode.localeCompare(b.pipelineCode);
  });
};

/**
 * Filter pipelines by status.
 * 
 * @param pipelines - Array of pipeline coverage
 * @param statuses - Statuses to filter by
 * @returns Filtered array
 */
export const filterPipelinesByStatus = (
  pipelines: PipelineCoverageDTO[],
  statuses: WorkflowStatus[]
): PipelineCoverageDTO[] => {
  return pipelines.filter(p => statuses.includes(p.workflowStatus));
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
  return pipelines.filter(p => 
    p.workflowStatus === 'NOT_RECORDED' ||
    p.workflowStatus === 'DRAFT' ||
    p.workflowStatus === 'REJECTED' ||
    p.isOverdue
  );
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
  return pipelines.filter(p => p.workflowStatus === 'SUBMITTED');
};

/**
 * Check if slot is overdue.
 * 
 * @param slotEndTime - Slot end time (HH:mm:ss)
 * @param slotDate - Slot date (YYYY-MM-DD)
 * @returns True if current time is past slot end
 */
export const isSlotOverdue = (slotEndTime: string, slotDate: string): boolean => {
  const now = new Date();
  const slotDateTime = new Date(`${slotDate}T${slotEndTime}`);
  return now > slotDateTime;
};

/**
 * Get time remaining until slot deadline.
 * 
 * @param slotEndTime - Slot end time (HH:mm:ss)
 * @param slotDate - Slot date (YYYY-MM-DD)
 * @returns Time remaining in minutes (negative if overdue)
 */
export const getTimeRemainingMinutes = (
  slotEndTime: string,
  slotDate: string
): number => {
  const now = new Date();
  const slotDateTime = new Date(`${slotDate}T${slotEndTime}`);
  const diffMs = slotDateTime.getTime() - now.getTime();
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
