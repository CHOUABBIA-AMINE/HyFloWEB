/**
 * Flow Core DTOs - Barrel Export
 * 
 * Core module DTOs for data entities and monitoring.
 * Workflow DTOs are in flow/workflow/dto.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-11 - Removed intelligence DTOs (migrated to intelligence module)
 * @updated 2026-02-13 - Fixed: Removed workflow DTO exports (in workflow/dto)
 */

// Core Entity DTOs
export * from './FlowReadingDTO';
export * from './FlowAlertDTO';
export * from './FlowEventDTO';
export * from './FlowForecastDTO';
export * from './FlowOperationDTO';
export * from './FlowThresholdDTO';

// Monitoring/Coverage DTO
export * from './SlotCoverageDTO';

/**
 * WORKFLOW DTOs LOCATION:
 * 
 * ReadingSubmitRequestDTO → flow/workflow/dto/ReadingSubmitRequestDTO
 * ReadingValidationRequestDTO → flow/workflow/dto/ReadingValidationRequestDTO
 * 
 * Import from workflow module:
 * ```typescript
 * import { ReadingSubmitRequestDTO } from '@/modules/flow/workflow/dto';
 * import { ReadingValidationRequestDTO } from '@/modules/flow/workflow/dto';
 * ```
 * 
 * INTELLIGENCE DTOs LOCATION:
 * 
 * PipelineCoverageDTO → flow/intelligence/dto/analytics/PipelineCoverageDTO
 * SlotCoverageRequestDTO → flow/intelligence/dto/monitoring/SlotCoverageRequestDTO
 * SlotCoverageResponseDTO → flow/intelligence/dto/monitoring/SlotCoverageResponseDTO
 * 
 * Import from intelligence module:
 * ```typescript
 * import { PipelineCoverageDTO } from '@/modules/flow/intelligence/dto/analytics';
 * import { SlotCoverageRequestDTO } from '@/modules/flow/intelligence/dto/monitoring';
 * ```
 */
