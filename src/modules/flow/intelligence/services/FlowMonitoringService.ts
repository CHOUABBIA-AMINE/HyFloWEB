/**
 * Flow Monitoring Service - Flow Intelligence Module
 *
 * Operational monitoring and analytics for flow readings.
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.intelligence.controller.FlowMonitoringController
 *
 * @author CHOUABBIA Amine
 * @created 2026-02-11
 * @updated 2026-03-29 - Fixed BASE_URL: /flow/monitoring → /flow/intelligence/monitoring
 * @package flow/intelligence/services
 */

import axiosInstance from '@/shared/config/axios';
import type { Page, Pageable } from '@/types/pagination';
import type { FlowReadingReadDTO } from '../../core/dto/FlowReadingReadDTO';
import type {
  DailyCompletionStatisticsDTO,
  ValidatorWorkloadDTO,
  SubmissionTrendDTO,
  PipelineCoverageDetailDTO,
} from '../dto/analytics';

// ✅ Corrected: matches @RequestMapping on FlowMonitoringController
const BASE_URL = '/flow/intelligence/monitoring';

export class FlowMonitoringService {

  /**
   * GET /flow/intelligence/monitoring/pending-validations
   * Returns readings in SUBMITTED status awaiting validation.
   *
   * @param pipelineId - Pipeline ID to filter
   * @param pageable   - Pagination parameters
   */
  static async getPendingValidations(
    pipelineId: number,
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<FlowReadingReadDTO>> {
    if (!pipelineId || pipelineId <= 0) {
      throw new Error('pipelineId is required and must be positive');
    }

    const response = await axiosInstance.get<Page<FlowReadingReadDTO>>(
      `${BASE_URL}/pending-validations`,
      {
        params: {
          pipelineId,
          page: pageable.page,
          size: pageable.size,
        },
      }
    );

    return response.data;
  }

  /**
   * GET /flow/intelligence/monitoring/overdue-readings
   * Returns readings past their validation deadline.
   *
   * @param pipelineId - Pipeline ID to filter
   * @param asOfDate   - Date to check (YYYY-MM-DD), defaults to today
   * @param pageable   - Pagination parameters
   */
  static async getOverdueReadings(
    pipelineId: number,
    asOfDate?: string,
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<FlowReadingReadDTO>> {
    if (!pipelineId || pipelineId <= 0) {
      throw new Error('pipelineId is required and must be positive');
    }

    const targetDate = asOfDate || new Date().toISOString().split('T')[0];

    const response = await axiosInstance.get<Page<FlowReadingReadDTO>>(
      `${BASE_URL}/overdue-readings`,
      {
        params: {
          pipelineId,
          asOfDate: targetDate,
          page: pageable.page,
          size: pageable.size,
        },
      }
    );

    return response.data;
  }

  /**
   * GET /flow/intelligence/monitoring/daily-statistics
   * Returns aggregated completion statistics by date.
   *
   * @param pipelineId - Pipeline ID to filter
   * @param startDate  - Start date (YYYY-MM-DD)
   * @param endDate    - End date (YYYY-MM-DD)
   */
  static async getDailyStatistics(
    pipelineId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyCompletionStatisticsDTO[]> {
    if (!pipelineId || pipelineId <= 0) {
      throw new Error('pipelineId is required and must be positive');
    }

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Dates must be in YYYY-MM-DD format');
    }

    const response = await axiosInstance.get<DailyCompletionStatisticsDTO[]>(
      `${BASE_URL}/daily-statistics`,
      {
        params: { pipelineId, startDate, endDate },
      }
    );

    return response.data;
  }

  /**
   * GET /flow/intelligence/monitoring/validator-workload
   * Returns workload distribution by validator.
   * No filtering params — backend returns global workload.
   */
  static async getValidatorWorkload(): Promise<ValidatorWorkloadDTO[]> {
    const response = await axiosInstance.get<ValidatorWorkloadDTO[]>(
      `${BASE_URL}/validator-workload`
    );

    return response.data;
  }

  /**
   * GET /flow/intelligence/monitoring/submission-trend
   * Returns time-series data showing submission patterns over time.
   *
   * @param pipelineId - Pipeline ID to filter
   * @param startDate  - Start date (YYYY-MM-DD)
   * @param endDate    - End date (YYYY-MM-DD)
   */
  static async getSubmissionTrend(
    pipelineId: number,
    startDate: string,
    endDate: string
  ): Promise<SubmissionTrendDTO[]> {
    if (!pipelineId || pipelineId <= 0) {
      throw new Error('pipelineId is required and must be positive');
    }

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const response = await axiosInstance.get<SubmissionTrendDTO[]>(
      `${BASE_URL}/submission-trend`,
      {
        params: { pipelineId, startDate, endDate },
      }
    );

    return response.data;
  }

  /**
   * GET /flow/intelligence/monitoring/pipeline-coverage
   * Returns coverage percentage for each pipeline over a date range.
   *
   * @param pipelineId - Pipeline ID to filter
   * @param startDate  - Start date (YYYY-MM-DD)
   * @param endDate    - End date (YYYY-MM-DD)
   */
  static async getPipelineCoverage(
    pipelineId: number,
    startDate: string,
    endDate: string
  ): Promise<PipelineCoverageDetailDTO[]> {
    if (!pipelineId || pipelineId <= 0) {
      throw new Error('pipelineId is required and must be positive');
    }

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const response = await axiosInstance.get<PipelineCoverageDetailDTO[]>(
      `${BASE_URL}/pipeline-coverage`,
      {
        params: { pipelineId, startDate, endDate },
      }
    );

    return response.data;
  }

  /**
   * Convenience method: fetches multiple metrics in parallel for dashboard pages.
   *
   * @param pipelineId - Pipeline ID
   * @param date       - Target date (YYYY-MM-DD), defaults to today
   */
  static async getDashboardData(
    pipelineId: number,
    date?: string
  ): Promise<{
    pending: Page<FlowReadingReadDTO>;
    overdue: Page<FlowReadingReadDTO>;
    todayStats: DailyCompletionStatisticsDTO | null;
  }> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [pending, overdue, dailyStats] = await Promise.all([
      this.getPendingValidations(pipelineId, { page: 0, size: 10 }),
      this.getOverdueReadings(pipelineId, targetDate, { page: 0, size: 10 }),
      this.getDailyStatistics(pipelineId, targetDate, targetDate),
    ]);

    return {
      pending,
      overdue,
      todayStats: dailyStats.length > 0 ? dailyStats[0] : null,
    };
  }
}

export default FlowMonitoringService;
