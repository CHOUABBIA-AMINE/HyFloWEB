/**
 * Data Quality Issue Service - Flow Intelligence Module
 *
 * Provides access to detected data quality issues on flow readings.
 * Strictly aligned with backend:
 *   dz.sh.trc.hyflo.flow.intelligence.controller.DataQualityIssueController
 *
 * Endpoints base: /flow/intelligence/data-quality-issues
 *
 * @author CHOUABBIA Amine
 * @created 2026-03-29
 * @package flow/intelligence/services
 */

import axiosInstance from '@/shared/config/axios';
import type { Page, Pageable } from '@/types/pagination';

// ── Inline read DTO (mirrors backend DataQualityIssueReadDTO) ──────────────────

export interface DataQualityIssueReadDTO {
  id: number;
  /** ISO 8601 — when the issue was detected */
  detectedAt: string;
  /** Issue type code (e.g. MISSING_VALUE, OUT_OF_RANGE, DUPLICATE_ENTRY) */
  issueTypeCode: string;
  /** Human-readable description of the issue */
  description: string;
  /** Severity: LOW | MEDIUM | HIGH */
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  /** ID of the affected flow reading */
  flowReadingId: number;
  /** Reading date (YYYY-MM-DD) of the affected reading */
  readingDate: string;
  /** Pipeline ID of the affected reading */
  pipelineId: number;
  /** Pipeline name (denormalised for display) */
  pipelineName: string;
  /** Whether the issue has been resolved */
  resolved: boolean;
  /** ISO 8601 — when resolved, null if still open */
  resolvedAt?: string | null;
}

const BASE_URL = '/flow/intelligence/data-quality-issues';

export class DataQualityIssueService {

  /**
   * GET /flow/intelligence/data-quality-issues
   * Returns a paginated list of all data quality issues.
   *
   * @param pageable - Pagination parameters
   */
  static async getAll(
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<DataQualityIssueReadDTO>> {
    const response = await axiosInstance.get<Page<DataQualityIssueReadDTO>>(BASE_URL, {
      params: { page: pageable.page, size: pageable.size },
    });
    return response.data;
  }

  /**
   * GET /flow/intelligence/data-quality-issues/{id}
   * Returns a single issue by ID.
   *
   * @param id - Issue ID
   */
  static async getById(id: number): Promise<DataQualityIssueReadDTO> {
    if (!id || id <= 0) throw new Error('Issue ID must be positive');
    const response = await axiosInstance.get<DataQualityIssueReadDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * GET /flow/intelligence/data-quality-issues/pipeline/{pipelineId}
   * Returns all data quality issues for a specific pipeline.
   *
   * @param pipelineId - Pipeline ID
   * @param pageable   - Pagination parameters
   */
  static async getByPipeline(
    pipelineId: number,
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<DataQualityIssueReadDTO>> {
    if (!pipelineId || pipelineId <= 0) throw new Error('pipelineId must be positive');
    const response = await axiosInstance.get<Page<DataQualityIssueReadDTO>>(
      `${BASE_URL}/pipeline/${pipelineId}`,
      { params: { page: pageable.page, size: pageable.size } }
    );
    return response.data;
  }

  /**
   * GET /flow/intelligence/data-quality-issues/unresolved
   * Returns only unresolved issues.
   *
   * @param pageable - Pagination parameters
   */
  static async getUnresolved(
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<DataQualityIssueReadDTO>> {
    const response = await axiosInstance.get<Page<DataQualityIssueReadDTO>>(
      `${BASE_URL}/unresolved`,
      { params: { page: pageable.page, size: pageable.size } }
    );
    return response.data;
  }
}

export default DataQualityIssueService;
