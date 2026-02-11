/**
 * Pipeline Coverage DTO - Flow Intelligence Module
 * 
 * Aggregated coverage statistics for pipeline monitoring.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.dto.analytics.PipelineCoverageDTO
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/dto/analytics
 */

export interface PipelineCoverageDTO {
  /**
   * Total number of pipelines
   * Backend: Integer
   */
  totalPipelines: number;
  
  /**
   * Number of pipelines with full coverage (100%)
   * Backend: Integer
   */
  fullCoveragePipelines: number;
  
  /**
   * Number of pipelines with partial coverage (1-99%)
   * Backend: Integer
   */
  partialCoveragePipelines: number;
  
  /**
   * Number of pipelines with no coverage (0%)
   * Backend: Integer
   */
  noCoveragePipelines: number;
  
  /**
   * Average coverage percentage across all pipelines
   * Backend: BigDecimal
   * @example 87.50
   */
  averageCoveragePercentage: number;
}
