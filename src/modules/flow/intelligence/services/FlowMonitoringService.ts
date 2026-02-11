/**
 * Flow Monitoring Service - Flow Intelligence Module
 * 
 * Operational monitoring and analytics for flow readings.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.controller.FlowMonitoringController
 * 
 * This service provides:
 * - Pending validations tracking
 * - Overdue readings detection
 * - Daily completion statistics
 * - Validator workload analysis
 * - Submission trend analytics
 * - Pipeline coverage reporting
 * 
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @package flow/intelligence/services
 */

import axiosInstance from '@/shared/config/axios';
import type { Page, Pageable } from '@/types/pagination';
import type { FlowReadingDTO } from '../../core/dto/FlowReadingDTO';
import type {
  DailyCompletionStatisticsDTO,
  ValidatorWorkloadDTO,
  SubmissionTrendDTO,
  PipelineCoverageDetailDTO,
} from '../dto/analytics';

const BASE_URL = '/flow/monitoring';  // ✅ Intelligence module base path

/**
 * Time grouping intervals for trend analysis
 */
export type TrendGroupBy = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';

export class FlowMonitoringService {
  
  /**
   * Get pending validations by structure
   * 
   * Endpoint: GET /flow/monitoring/pending-validations
   * 
   * Returns readings in SUBMITTED status awaiting validation.
   * Ordered by submission time (oldest first) for FIFO processing.
   * 
   * @param structureId - Structure ID to filter
   * @param pageable - Pagination parameters
   * @returns Page of pending readings
   * 
   * @example
   * ```typescript
   * const pending = await FlowMonitoringService.getPendingValidations(1, {
   *   page: 0,
   *   size: 20
   * });
   * console.log(`Pending validations: ${pending.totalElements}`);
   * ```
   */
  static async getPendingValidations(
    structureId: number,
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<FlowReadingDTO>> {
    if (!structureId || structureId <= 0) {
      throw new Error('Structure ID is required and must be positive');
    }
    
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(
      `${BASE_URL}/pending-validations`,
      {
        params: {
          structureId,
          page: pageable.page,
          size: pageable.size,
        },
      }
    );
    
    return response.data;
  }
  
  /**
   * Get overdue readings by structure
   * 
   * Endpoint: GET /flow/monitoring/overdue-readings
   * 
   * Returns readings past their validation deadline (slot end time).
   * Critical for operational awareness of delayed data.
   * 
   * @param structureId - Structure ID to filter
   * @param asOfDate - Date to check (YYYY-MM-DD), defaults to today
   * @param pageable - Pagination parameters
   * @returns Page of overdue readings
   * 
   * @example
   * ```typescript
   * const overdue = await FlowMonitoringService.getOverdueReadings(1);
   * overdue.content.forEach(reading => {
   *   console.log(`Overdue: ${reading.pipeline.name} - ${reading.readingSlot.code}`);
   * });
   * ```
   */
  static async getOverdueReadings(
    structureId: number,
    asOfDate?: string,
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<FlowReadingDTO>> {
    if (!structureId || structureId <= 0) {
      throw new Error('Structure ID is required and must be positive');
    }
    
    // Default to today if not provided
    const targetDate = asOfDate || new Date().toISOString().split('T')[0];
    
    const response = await axiosInstance.get<Page<FlowReadingDTO>>(
      `${BASE_URL}/overdue-readings`,
      {
        params: {
          structureId,
          asOfDate: targetDate,
          page: pageable.page,
          size: pageable.size,
        },
      }
    );
    
    return response.data;
  }
  
  /**
   * Get daily completion statistics
   * 
   * Endpoint: GET /flow/monitoring/daily-statistics
   * 
   * Returns aggregated statistics for reading completion by date.
   * Shows recording rates, submission rates, and validation completion percentages.
   * Essential for KPI dashboards and performance monitoring.
   * 
   * @param structureId - Structure ID to filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Daily statistics array ordered by date
   * 
   * @example
   * ```typescript
   * const stats = await FlowMonitoringService.getDailyStatistics(
   *   1,
   *   '2026-02-01',
   *   '2026-02-11'
   * );
   * 
   * stats.forEach(day => {
   *   console.log(`${day.date}: ${day.validationCompletionPercentage}% validated`);
   * });
   * ```
   */
  static async getDailyStatistics(
    structureId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyCompletionStatisticsDTO[]> {
    if (!structureId || structureId <= 0) {
      throw new Error('Structure ID is required and must be positive');
    }
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Dates must be in YYYY-MM-DD format');
    }
    
    const response = await axiosInstance.get<DailyCompletionStatisticsDTO[]>(
      `${BASE_URL}/daily-statistics`,
      {
        params: {
          structureId,
          startDate,
          endDate,
        },
      }
    );
    
    return response.data;
  }
  
  /**
   * Get validator workload distribution
   * 
   * Endpoint: GET /flow/monitoring/validator-workload
   * 
   * Returns workload distribution showing validation counts by validator.
   * Helps identify bottlenecks and balance workload distribution.
   * 
   * @param structureId - Structure ID to filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Validator workload array ordered by validation count (descending)
   * 
   * @example
   * ```typescript
   * const workload = await FlowMonitoringService.getValidatorWorkload(
   *   1,
   *   '2026-02-01',
   *   '2026-02-11'
   * );
   * 
   * console.log('Top validators:');
   * workload.slice(0, 5).forEach(v => {
   *   console.log(`${v.validatorName}: ${v.validationCount} validations`);
   * });
   * ```
   */
  static async getValidatorWorkload(
    structureId: number,
    startDate: string,
    endDate: string
  ): Promise<ValidatorWorkloadDTO[]> {
    if (!structureId || structureId <= 0) {
      throw new Error('Structure ID is required and must be positive');
    }
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const response = await axiosInstance.get<ValidatorWorkloadDTO[]>(
      `${BASE_URL}/validator-workload`,
      {
        params: {
          structureId,
          startDate,
          endDate,
        },
      }
    );
    
    return response.data;
  }
  
  /**
   * Get submission trends
   * 
   * Endpoint: GET /flow/monitoring/submission-trends
   * 
   * Returns time-series data showing submission patterns over time.
   * Useful for identifying peak submission times and operational patterns.
   * 
   * @param structureId - Structure ID to filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param groupBy - Time grouping: HOUR, DAY, WEEK, or MONTH
   * @returns Submission trend array ordered by time period
   * 
   * @example
   * ```typescript
   * // Get daily trends for this month
   * const trends = await FlowMonitoringService.getSubmissionTrends(
   *   1,
   *   '2026-02-01',
   *   '2026-02-28',
   *   'DAY'
   * );
   * 
   * // Plot on chart
   * const chartData = trends.map(t => ({
   *   x: t.period,
   *   y: t.submissionCount
   * }));
   * ```
   */
  static async getSubmissionTrends(
    structureId: number,
    startDate: string,
    endDate: string,
    groupBy: TrendGroupBy = 'DAY'
  ): Promise<SubmissionTrendDTO[]> {
    if (!structureId || structureId <= 0) {
      throw new Error('Structure ID is required and must be positive');
    }
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const validGroupBy: TrendGroupBy[] = ['HOUR', 'DAY', 'WEEK', 'MONTH'];
    if (!validGroupBy.includes(groupBy)) {
      throw new Error(`Invalid groupBy. Must be one of: ${validGroupBy.join(', ')}`);
    }
    
    const response = await axiosInstance.get<SubmissionTrendDTO[]>(
      `${BASE_URL}/submission-trends`,
      {
        params: {
          structureId,
          startDate,
          endDate,
          groupBy,
        },
      }
    );
    
    return response.data;
  }
  
  /**
   * Get pipeline coverage by date range
   * 
   * Endpoint: GET /flow/monitoring/pipeline-coverage
   * 
   * Returns coverage percentage for each pipeline over a date range.
   * Shows which pipelines consistently submit readings vs those with gaps.
   * Critical for identifying data quality issues.
   * 
   * @param structureId - Structure ID to filter
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Pipeline coverage array ordered by coverage percentage (descending)
   * 
   * @example
   * ```typescript
   * const coverage = await FlowMonitoringService.getPipelineCoverage(
   *   1,
   *   '2026-02-01',
   *   '2026-02-11'
   * );
   * 
   * // Find pipelines with low coverage
   * const lowCoverage = coverage.filter(p => p.coveragePercentage < 80);
   * console.log(`${lowCoverage.length} pipelines with <80% coverage`);
   * ```
   */
  static async getPipelineCoverage(
    structureId: number,
    startDate: string,
    endDate: string
  ): Promise<PipelineCoverageDetailDTO[]> {
    if (!structureId || structureId <= 0) {
      throw new Error('Structure ID is required and must be positive');
    }
    
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const response = await axiosInstance.get<PipelineCoverageDetailDTO[]>(
      `${BASE_URL}/pipeline-coverage`,
      {
        params: {
          structureId,
          startDate,
          endDate,
        },
      }
    );
    
    return response.data;
  }
  
  /**
   * Get real-time monitoring dashboard data
   * 
   * Convenience method that fetches multiple metrics in parallel.
   * Useful for dashboard pages that need comprehensive overview.
   * 
   * @param structureId - Structure ID
   * @param date - Target date (YYYY-MM-DD), defaults to today
   * @returns Combined monitoring data
   * 
   * @example
   * ```typescript
   * const dashboard = await FlowMonitoringService.getDashboardData(1);
   * 
   * console.log(`Pending: ${dashboard.pending.totalElements}`);
   * console.log(`Overdue: ${dashboard.overdue.totalElements}`);
   * console.log(`Today completion: ${dashboard.todayStats?.validationCompletionPercentage}%`);
   * ```
   */
  static async getDashboardData(
    structureId: number,
    date?: string
  ): Promise<{
    pending: Page<FlowReadingDTO>;
    overdue: Page<FlowReadingDTO>;
    todayStats: DailyCompletionStatisticsDTO | null;
  }> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Fetch all in parallel
    const [pending, overdue, dailyStats] = await Promise.all([
      this.getPendingValidations(structureId, { page: 0, size: 10 }),
      this.getOverdueReadings(structureId, targetDate, { page: 0, size: 10 }),
      this.getDailyStatistics(structureId, targetDate, targetDate),
    ]);
    
    return {
      pending,
      overdue,
      todayStats: dailyStats.length > 0 ? dailyStats[0] : null,
    };
  }
}

export default FlowMonitoringService;
