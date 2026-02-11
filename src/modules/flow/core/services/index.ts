/**
 * Flow Core Services - Barrel Export
 * 
 * Core module services for CRUD operations only.
 * Monitoring service moved to intelligence module.
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-04
 * @updated 2026-02-11 - Removed FlowMonitoringService (migrated to intelligence module)
 */

// Core CRUD services only
export * from './FlowReadingService';
export * from './FlowAlertService';
export * from './FlowEventService';
export * from './FlowForecastService';
export * from './FlowOperationService';
export * from './FlowThresholdService';

// Slot coverage service (legacy, consider moving to intelligence)
export * from './SlotCoverageService';

/**
 * MIGRATION NOTICE:
 * 
 * FlowMonitoringService was moved to intelligence module.
 * 
 * Update your imports:
 * ```typescript
 * // OLD (deprecated)
 * import { FlowMonitoringService } from '@/modules/flow/core/services';
 * 
 * // NEW (correct)
 * import { FlowMonitoringService } from '@/modules/flow/intelligence/services';
 * ```
 * 
 * The new service uses updated endpoints:
 * - GET /flow/monitoring/pending-validations
 * - GET /flow/monitoring/overdue-readings
 * - GET /flow/monitoring/daily-statistics
 * - GET /flow/monitoring/validator-workload
 * - GET /flow/monitoring/submission-trends
 * - GET /flow/monitoring/pipeline-coverage
 */
