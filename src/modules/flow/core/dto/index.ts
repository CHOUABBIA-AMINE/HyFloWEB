/**
 * Flow Core DTOs - Barrel Export
 *
 * Core module DTOs for data entities and monitoring.
 * Workflow DTOs are in flow/workflow/dto.
 *
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-03-29 - Added FlowReadingReadDTO (read-only response DTO)
 */

// Core Entity DTOs
export * from './FlowReadingDTO';
export * from './FlowReadingReadDTO';
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
 * ReadingSubmitRequestDTO       → flow/workflow/dto/ReadingSubmitRequestDTO
 * ReadingValidationRequestDTO   → flow/workflow/dto/ReadingValidationRequestDTO
 *
 * INTELLIGENCE DTOs LOCATION:
 *
 * PipelineCoverageDTO          → flow/intelligence/dto/analytics/PipelineCoverageDTO
 * SlotCoverageRequestDTO       → flow/intelligence/dto/monitoring/SlotCoverageRequestDTO
 * SlotCoverageResponseDTO      → flow/intelligence/dto/monitoring/SlotCoverageResponseDTO
 */
