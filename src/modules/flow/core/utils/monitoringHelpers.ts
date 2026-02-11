/**
 * Monitoring Helpers
 * 
 * Utility functions for flow monitoring operations.
 * Updated to work with nested DTO structure.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-11 13:15 - Fixed: Use correct SlotCoverageDTO imports
 * @updated 2026-02-04 - Updated for nested DTO support
 * @updated 2026-02-04 - Fixed PipelineDTO field access
 * @package flow/core/utils
 */

import type { PipelineCoverageItemDTO, SlotCoverageDTO } from '../dto/SlotCoverageDTO';
import { getLocalizedDesignation } from '../../common/dto/ReadingSlotDTO';

/**
 * Get status color for UI display based on validation status.
 * 
 * @param pipeline - Pipeline coverage with nested validationStatus
 * @returns MUI color
 */
export const getStatusColor = (
  pipeline: PipelineCoverageItemDTO
): 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error' => {
  // Use status field directly
  const status = pipeline.status || 'NOT_RECORDED';
  
  const colorMap: Record<string, 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error'> = {
    'NOT_RECORDED': 'default',
    'DRAFT': 'info',
    'SUBMITTED': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'error',
  };
  
  return colorMap[status] || 'default';
};

/**
 * Get status label for display (localized).
 * 
 * @param pipeline - Pipeline coverage item
 * @param lang - Language (en, fr, ar)
 * @returns Localized status label
 */
export const getStatusLabel = (
  pipeline: PipelineCoverageItemDTO,
  lang: 'en' | 'fr' | 'ar' = 'en'
): string => {
  const status = pipeline.status || 'NOT_RECORDED';
  
  const labels: Record<string, Record<string, string>> = {
    'NOT_RECORDED': {
      en: 'Not Recorded',
      fr: 'Non enregistré',
      ar: 'غير مسجل',
    },
    'DRAFT': {
      en: 'Draft',
      fr: 'Brouillon',
      ar: 'مسودة',
    },
    'SUBMITTED': {
      en: 'Submitted',
      fr: 'Soumis',
      ar: 'مقدم',
    },
    'APPROVED': {
      en: 'Approved',
      fr: 'Approuvé',
      ar: 'موافق عليه',
    },
    'REJECTED': {
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
 * Calculate completion rate from slot coverage.
 * 
 * @param coverage - Slot coverage
 * @returns Completion percentage (0-100)
 */
export const calculateCompletionRate = (coverage: SlotCoverageDTO): number => {
  if (coverage.summary.totalPipelines === 0) return 0;
  
  // Completed = approved (submitted counts as "in progress")
  const completed = coverage.summary.approved;
  return Math.round((completed / coverage.summary.totalPipelines) * 100);
};

/**
 * Get workflow status priority for sorting.
 * 
 * @param pipeline - Pipeline coverage
 * @returns Priority number (lower = higher priority)
 */
export const getStatusPriority = (pipeline: PipelineCoverageItemDTO): number => {
  const status = pipeline.status || 'NOT_RECORDED';
  
  const priorities: Record<string, number> = {
    'NOT_RECORDED': 1,  // Highest priority (needs recording)
    'REJECTED': 2,      // Needs correction
    'DRAFT': 3,         // Needs submission
    'SUBMITTED': 4,     // Needs validation
    'APPROVED': 5,      // Completed
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
  pipelines: PipelineCoverageItemDTO[]
): PipelineCoverageItemDTO[] => {
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
 * Filter pipelines by status.
 * 
 * @param pipelines - Array of pipeline coverage
 * @param statuses - Statuses to filter by
 * @returns Filtered array
 */
export const filterPipelinesByStatus = (
  pipelines: PipelineCoverageItemDTO[],
  statuses: string[]
): PipelineCoverageItemDTO[] => {
  return pipelines.filter(p => statuses.includes(p.status));
};

/**
 * Get pipelines requiring attention.
 * 
 * @param pipelines - Array of pipeline coverage
 * @returns Pipelines needing action
 */
export const getPipelinesRequiringAttention = (
  pipelines: PipelineCoverageItemDTO[]
): PipelineCoverageItemDTO[] => {
  return pipelines.filter(p => {
    return (
      p.status === 'NOT_RECORDED' ||
      p.status === 'DRAFT' ||
      p.status === 'REJECTED'
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
  pipelines: PipelineCoverageItemDTO[]
): PipelineCoverageItemDTO[] => {
  return pipelines.filter(p => p.status === 'SUBMITTED');
};

/**
 * Get pipeline display name.
 * 
 * @param pipeline - Pipeline coverage
 * @param lang - Language (ignored for PipelineDTO as it doesn't have multilingual fields)
 * @returns Pipeline name
 */
export const getPipelineDisplayName = (
  pipeline: PipelineCoverageItemDTO,
  lang?: 'en' | 'fr' | 'ar'
): string => {
  if (!pipeline.pipeline) return `Pipeline ${pipeline.pipeline}`;
  
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
