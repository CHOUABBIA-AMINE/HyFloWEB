/**
 * Reading Validation Request DTO
 *
 * Workflow command for validating (approving or rejecting) flow readings.
 * Strictly aligned with backend:
 *   dz.sh.trc.hyflo.flow.workflow.dto.command.ReadingValidationRequestDTO
 *
 * Used as the request body for:
 *   POST /flow/workflow/readings/{id}/approve
 *   POST /flow/workflow/readings/{id}/reject
 *
 * The reading ID is carried in the URL path, NOT in the body.
 * The action (APPROVE / REJECT) is expressed by the endpoint choice,
 * NOT by a field in this DTO — the `action` field has been removed.
 *
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-03-29 - Removed `action` field (expressed via endpoint)
 *                     - Removed `readingId` field (carried in URL path)
 *                     - Removed `reading` nested DTO (not sent to backend)
 *                     - Kept employeeId + comments as the actual contract
 * @package flow/workflow/dto
 */

export interface ReadingValidationRequestDTO {
  /**
   * ID of the employee performing the validation.
   * Must be a valid validator with FLOW:APPROVE permission.
   */
  employeeId: number;

  /**
   * Validation comments.
   * Required when rejecting (action = REJECT).
   * Optional when approving.
   * Max 500 characters.
   */
  comments?: string;
}
