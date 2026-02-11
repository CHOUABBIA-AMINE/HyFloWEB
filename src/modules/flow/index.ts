/**
 * Flow Module
 * Main barrel export for all flow-related DTOs, services, and types
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 02-11-2026 - Added intelligence and workflow modules
 * 
 * Structure aligned with backend:
 * - flow/common: Common lookup/reference DTOs
 * - flow/core: Core business DTOs and services
 * - flow/type: Type classification DTOs
 * - flow/intelligence: Analytics and monitoring (DTOs and services)
 * - flow/workflow: Workflow state transitions
 */

// Common DTOs
export * from './common/dto';

// Core DTOs and Services
export * from './core/dto';
export * from './core/services';

// Type DTOs
export * from './type/dto';

// Intelligence Module (Analytics & Monitoring)
export * from './intelligence';

// Workflow Module
export * from './workflow';
