/**
 * Permission Helpers
 * 
 * Helper functions for checking permissions on pipelines.
 * Updated to work with nested DTO structure.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Updated for nested DTO support
 * @package flow/core/utils
 */

import { PipelineCoverageDTO } from '../dto/PipelineCoverageDTO';

/**
 * Check if pipeline can be edited.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if editable
 */
export const canEditPipeline = (pipeline: PipelineCoverageDTO): boolean => {
  const statusCode = pipeline.validationStatus?.code || 'NOT_RECORDED';
  return (
    pipeline.canEdit === true && 
    (statusCode === 'NOT_RECORDED' || statusCode === 'DRAFT' || statusCode === 'REJECTED')
  );
};

/**
 * Check if pipeline can be submitted.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if submittable
 */
export const canSubmitPipeline = (pipeline: PipelineCoverageDTO): boolean => {
  const statusCode = pipeline.validationStatus?.code || 'NOT_RECORDED';
  return pipeline.canSubmit === true && statusCode === 'DRAFT';
};

/**
 * Check if pipeline can be validated.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if validatable
 */
export const canValidatePipeline = (pipeline: PipelineCoverageDTO): boolean => {
  const statusCode = pipeline.validationStatus?.code || 'NOT_RECORDED';
  return pipeline.canValidate === true && statusCode === 'SUBMITTED';
};

/**
 * Get available actions for pipeline.
 * 
 * @param pipeline - Pipeline coverage
 * @returns Array of action strings
 */
export const getAvailableActions = (pipeline: PipelineCoverageDTO): string[] => {
  const actions: string[] = [];

  if (canEditPipeline(pipeline)) {
    actions.push('EDIT');
  }

  if (canSubmitPipeline(pipeline)) {
    actions.push('SUBMIT');
  }

  if (canValidatePipeline(pipeline)) {
    actions.push('APPROVE', 'REJECT');
  }

  return actions;
};
