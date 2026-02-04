/**
 * Permission Helpers
 * 
 * Helper functions for checking permissions on pipelines.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
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
  return pipeline.canEdit && 
         (pipeline.workflowStatus === 'NOT_RECORDED' || 
          pipeline.workflowStatus === 'DRAFT' ||
          pipeline.workflowStatus === 'REJECTED');
};

/**
 * Check if pipeline can be submitted.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if submittable
 */
export const canSubmitPipeline = (pipeline: PipelineCoverageDTO): boolean => {
  return pipeline.canSubmit && pipeline.workflowStatus === 'DRAFT';
};

/**
 * Check if pipeline can be validated.
 * 
 * @param pipeline - Pipeline coverage
 * @returns True if validatable
 */
export const canValidatePipeline = (pipeline: PipelineCoverageDTO): boolean => {
  return pipeline.canValidate && pipeline.workflowStatus === 'SUBMITTED';
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
