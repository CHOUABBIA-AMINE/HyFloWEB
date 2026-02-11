/**
 * Permission Helpers
 * 
 * Utilities for checking user permissions on flow operations.
 * Updated to work with nested DTO structure.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-11 13:15 - Fixed: Use correct SlotCoverageDTO imports
 * @updated 2026-02-04 - Updated for nested DTO support
 * @package flow/core/utils
 */

import type { PipelineCoverageItemDTO } from '../dto/SlotCoverageDTO';

/**
 * Check if user can edit a reading.
 * Reading is editable in DRAFT or REJECTED status.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if reading can be edited
 */
export const canEditReading = (pipeline: PipelineCoverageItemDTO): boolean => {
  const status = pipeline.status || 'NOT_RECORDED';
  return status === 'DRAFT' || status === 'REJECTED';
};

/**
 * Check if user can submit a reading.
 * Reading can be submitted only in DRAFT status.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if reading can be submitted
 */
export const canSubmitReading = (pipeline: PipelineCoverageItemDTO): boolean => {
  const status = pipeline.status || 'NOT_RECORDED';
  return status === 'DRAFT';
};

/**
 * Check if user can validate (approve/reject) a reading.
 * Reading can be validated only in SUBMITTED status.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if reading can be validated
 */
export const canValidateReading = (pipeline: PipelineCoverageItemDTO): boolean => {
  const status = pipeline.status || 'NOT_RECORDED';
  return status === 'SUBMITTED';
};

/**
 * Check if reading is in final state.
 * Final states are APPROVED (no further changes allowed).
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if reading is final
 */
export const isReadingFinal = (pipeline: PipelineCoverageItemDTO): boolean => {
  const status = pipeline.status || 'NOT_RECORDED';
  return status === 'APPROVED';
};

/**
 * Check if reading requires attention.
 * NOT_RECORDED, DRAFT, and REJECTED all require attention from operators.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if requires attention
 */
export const requiresAttention = (pipeline: PipelineCoverageItemDTO): boolean => {
  const status = pipeline.status || 'NOT_RECORDED';
  return (
    status === 'NOT_RECORDED' ||
    status === 'DRAFT' ||
    status === 'REJECTED'
  );
};
