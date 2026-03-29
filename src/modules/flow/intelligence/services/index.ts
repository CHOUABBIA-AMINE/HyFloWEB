/**
 * Flow Intelligence Services - Barrel Export
 *
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @updated 2026-03-29 - Added FlowAnomalyService, DataQualityIssueService
 *                     - Removed TrendGroupBy export (type removed in commit 13)
 */

export { FlowMonitoringService } from './FlowMonitoringService';

export { PipelineIntelligenceService } from './PipelineIntelligenceService';

export { FlowAnomalyService } from './FlowAnomalyService';
export type { FlowAnomalyReadDTO } from './FlowAnomalyService';

export { DataQualityIssueService } from './DataQualityIssueService';
export type { DataQualityIssueReadDTO } from './DataQualityIssueService';
