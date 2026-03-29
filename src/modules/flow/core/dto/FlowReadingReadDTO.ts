/**
 * Flow Reading Read DTO
 *
 * Read-only projection of a flow reading, returned by:
 *   - GET  /flow/core/reading/{id}
 *   - GET  /flow/intelligence/monitoring/pending-validations
 *   - GET  /flow/intelligence/monitoring/overdue-readings
 *   - POST /flow/workflow/readings/{id}/approve
 *   - POST /flow/workflow/readings/{id}/reject
 *
 * Strictly aligned with backend:
 *   dz.sh.trc.hyflo.flow.core.dto.FlowReadingReadDTO
 *
 * KEY DIFFERENCES from FlowReadingDTO (write DTO):
 *   - All relationship fields are nested DTOs, never raw IDs only
 *   - Includes workflowInstance summary
 *   - volumeM3 / volumeMscf instead of generic flowRate / containedVolume
 *   - inletPressureBar / outletPressureBar instead of generic pressure
 *   - submittedAt exposed (not present on write DTO)
 *
 * @author CHOUABBIA Amine
 * @created 2026-03-29
 * @package flow/core/dto
 */

import type { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import type { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import type { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

/** Minimal workflow instance summary embedded in read responses */
export interface WorkflowInstanceSummaryDTO {
  id: number;
  currentStateCode: string;
  currentStateLabel: string;
  startedAt: string;
  updatedAt: string;
  comment?: string | null;
}

export interface FlowReadingReadDTO {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: number;

  // ── Measurement data ──────────────────────────────────────────────────────
  /** Reading date (YYYY-MM-DD) */
  readingDate: string;

  /** Volume in cubic metres (m³) */
  volumeM3?: number | null;

  /** Volume in million standard cubic feet (Mscf) */
  volumeMscf?: number | null;

  /** Inlet pressure in bar */
  inletPressureBar?: number | null;

  /** Outlet pressure in bar */
  outletPressureBar?: number | null;

  /** Temperature in Celsius */
  temperatureCelsius?: number | null;

  /** Free-text notes (max 500 chars) */
  notes?: string | null;

  // ── Timestamps ────────────────────────────────────────────────────────────
  /** ISO 8601 — when the reading was recorded */
  recordedAt: string;

  /** ISO 8601 — when the reading was submitted into workflow */
  submittedAt?: string | null;

  /** ISO 8601 — when the reading was validated (approved or rejected) */
  validatedAt?: string | null;

  // ── Nested relationships ───────────────────────────────────────────────────
  /** Pipeline this reading belongs to */
  pipeline: PipelineDTO;

  /** Slot that governs this reading’s time window */
  readingSlot: ReadingSlotDTO;

  /** Current validation/workflow status */
  validationStatus: ValidationStatusDTO;

  /** Employee who recorded the reading */
  recordedBy: EmployeeDTO;

  /** Employee who validated the reading (null if pending) */
  validatedBy?: EmployeeDTO | null;

  /** Active workflow instance (null if not yet submitted) */
  workflowInstance?: WorkflowInstanceSummaryDTO | null;
}
