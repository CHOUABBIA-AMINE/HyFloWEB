/**
 * Workflow Status Type
 * 
 * Reading workflow statuses.
 * Aligned with backend: dz.sh.trc.hyflo.flow.core.enums.WorkflowStatus
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @package flow/core/types
 */

export type WorkflowStatus = 
  | 'NOT_RECORDED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';
