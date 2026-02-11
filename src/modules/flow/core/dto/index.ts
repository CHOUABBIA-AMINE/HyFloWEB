/**
 * Flow Core DTOs - Barrel Export
 * 
 * Core module DTOs for CRUD operations only.
 * Intelligence/monitoring DTOs moved to intelligence module.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-11 - Removed intelligence DTOs (migrated to intelligence module)
 */

// Core CRUD DTOs only
export * from './FlowReadingDTO';
export * from './FlowAlertDTO';
export * from './FlowEventDTO';
export * from './FlowForecastDTO';
export * from './FlowOperationDTO';
export * from './FlowThresholdDTO';

// Workflow DTOs (kept here for now)
export * from './ReadingSubmitRequestDTO';
export * from './ReadingValidationRequestDTO';

// Slot coverage DTO (legacy, consider moving to intelligence)
export * from './SlotCoverageDTO';

/**
 * MIGRATION NOTICE:
 * 
 * The following DTOs were moved to intelligence module:
 * 
 * - PipelineCoverageDTO → flow/intelligence/dto/analytics/PipelineCoverageDTO
 * - SlotCoverageRequestDTO → flow/intelligence/dto/monitoring/SlotCoverageRequestDTO
 * - SlotCoverageResponseDTO → flow/intelligence/dto/monitoring/SlotCoverageResponseDTO
 * 
 * Update your imports:
 * ```typescript
 * // OLD (deprecated)
 * import { PipelineCoverageDTO } from '@/modules/flow/core/dto';
 * 
 * // NEW (correct)
 * import { PipelineCoverageDTO } from '@/modules/flow/intelligence/dto/analytics';
 * import { SlotCoverageRequestDTO } from '@/modules/flow/intelligence/dto/monitoring';
 * ```
 */
