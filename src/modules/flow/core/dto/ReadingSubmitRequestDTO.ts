/**
 * Reading Submit Request DTO
 * 
 * Workflow command for submitting flow readings.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.ReadingSubmitRequestDTO
 * 
 * PATTERN: Dual representation (ID + nested DTO)
 * - ID fields: Used by backend for queries/updates
 * - Nested DTOs: Used by frontend for display (includes translations)
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-04 - Aligned with backend nested DTO pattern
 * @package flow/core/dto
 */

import { PipelineDTO } from '@/modules/network/core/dto/PipelineDTO';
import { ReadingSlotDTO } from '../../common/dto/ReadingSlotDTO';
import { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

export interface ReadingSubmitRequestDTO {
  /** Reading ID for update, null for new reading */
  readingId?: number | null;
  
  // ========== PIPELINE CONTEXT (ID + nested DTO) ==========
  
  /** Pipeline ID (required) */
  pipelineId: number;
  
  /** Pipeline details (code, name, translations) */
  pipeline?: PipelineDTO;
  
  // ========== READING CONTEXT ==========
  
  /** Date of the reading (YYYY-MM-DD, required) */
  readingDate: string;
  
  // ========== SLOT CONTEXT (ID + nested DTO) ==========
  
  /** Reading slot ID (required) */
  slotId: number;
  
  /** Reading slot details (time range, translations) */
  slot?: ReadingSlotDTO;
  
  // ========== OPERATOR CONTEXT (ID + nested DTO) ==========
  
  /** Employee recording the reading (required) */
  employeeId: number;
  
  /** Employee details (name, structure) */
  employee?: EmployeeDTO;
  
  // ========== MEASUREMENT DATA ==========
  
  /** Pressure in bar (required, 0.0-500.0) */
  pressure: number;
  
  /** Temperature in Celsius (required, -50.0 to 200.0) */
  temperature: number;
  
  /** Flow rate in m³/h (required, >= 0) */
  flowRate: number;
  
  /** Contained volume in m³ (optional, >= 0) */
  containedVolume?: number;
  
  // ========== METADATA ==========
  
  /** Additional notes or observations (max 500 chars) */
  notes?: string;
  
  /** Submit immediately (SUBMITTED) or save as draft (DRAFT) */
  submitImmediately?: boolean; // true = SUBMITTED, false/null = DRAFT
}
