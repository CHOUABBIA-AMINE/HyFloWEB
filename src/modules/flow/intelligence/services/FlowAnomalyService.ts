/**
 * Flow Anomaly Service - Flow Intelligence Module
 *
 * Provides access to detected flow anomalies.
 * Strictly aligned with backend:
 *   dz.sh.trc.hyflo.flow.intelligence.controller.FlowAnomalyController
 *
 * Endpoints base: /flow/intelligence/anomalies
 *
 * @author CHOUABBIA Amine
 * @created 2026-03-29
 * @package flow/intelligence/services
 */

import axiosInstance from '@/shared/config/axios';
import type { Page, Pageable } from '@/types/pagination';

// ── Inline read DTO (mirrors backend FlowAnomalyReadDTO) ──────────────────────

export interface FlowAnomalyReadDTO {
  id: number;
  /** ISO 8601 — when the anomaly was detected */
  detectedAt: string;
  /** Short description of the anomaly */
  description: string;
  /** Severity level: LOW | MEDIUM | HIGH | CRITICAL */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Anomaly type code (e.g. PRESSURE_SPIKE, VOLUME_DROP) */
  anomalyTypeCode: string;
  /** Pipeline ID where the anomaly was observed */
  pipelineId: number;
  /** Pipeline name (denormalised for display) */
  pipelineName: string;
  /** Whether the anomaly has been acknowledged by an operator */
  acknowledged: boolean;
  /** ISO 8601 — when acknowledged, null if pending */
  acknowledgedAt?: string | null;
}

const BASE_URL = '/flow/intelligence/anomalies';

export class FlowAnomalyService {

  /**
   * GET /flow/intelligence/anomalies
   * Returns a paginated list of all anomalies.
   *
   * @param pageable - Pagination parameters
   */
  static async getAll(
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<FlowAnomalyReadDTO>> {
    const response = await axiosInstance.get<Page<FlowAnomalyReadDTO>>(BASE_URL, {
      params: { page: pageable.page, size: pageable.size },
    });
    return response.data;
  }

  /**
   * GET /flow/intelligence/anomalies/{id}
   * Returns a single anomaly by ID.
   *
   * @param id - Anomaly ID
   */
  static async getById(id: number): Promise<FlowAnomalyReadDTO> {
    if (!id || id <= 0) throw new Error('Anomaly ID must be positive');
    const response = await axiosInstance.get<FlowAnomalyReadDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * GET /flow/intelligence/anomalies/pipeline/{pipelineId}
   * Returns anomalies for a specific pipeline.
   *
   * @param pipelineId - Pipeline ID
   * @param pageable   - Pagination parameters
   */
  static async getByPipeline(
    pipelineId: number,
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<FlowAnomalyReadDTO>> {
    if (!pipelineId || pipelineId <= 0) throw new Error('pipelineId must be positive');
    const response = await axiosInstance.get<Page<FlowAnomalyReadDTO>>(
      `${BASE_URL}/pipeline/${pipelineId}`,
      { params: { page: pageable.page, size: pageable.size } }
    );
    return response.data;
  }

  /**
   * GET /flow/intelligence/anomalies/unacknowledged
   * Returns anomalies that have not yet been acknowledged.
   *
   * @param pageable - Pagination parameters
   */
  static async getUnacknowledged(
    pageable: Pageable = { page: 0, size: 20 }
  ): Promise<Page<FlowAnomalyReadDTO>> {
    const response = await axiosInstance.get<Page<FlowAnomalyReadDTO>>(
      `${BASE_URL}/unacknowledged`,
      { params: { page: pageable.page, size: pageable.size } }
    );
    return response.data;
  }
}

export default FlowAnomalyService;
