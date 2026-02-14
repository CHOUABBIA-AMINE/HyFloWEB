/**
 * Pipeline Intelligence Service
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description Service for consuming pipeline intelligence APIs.
 *              Provides dashboard, health, and analytics data.
 *              
 * @backend dz.sh.trc.hyflo.flow.intelligence.controller.PipelineIntelligenceController
 */

import axiosInstance from '@/shared/config/axios';
import type {
  PipelineDynamicDashboardDTO,
  PipelineHealthDTO,
} from '../dto';

const BASE_URL = '/flow/intelligence/pipeline';

/**
 * Pipeline Intelligence Service
 * Real-time operational intelligence and dashboard data
 */
export class PipelineIntelligenceService {
  /**
   * Get real-time operational dashboard for a pipeline
   * 
   * Includes:
   * - Latest reading
   * - Key metrics (typed with KeyMetricsDTO)
   * - Health indicators
   * - 24h statistics
   * - Recent activity
   * - Status indicators
   * - Data quality metrics
   * 
   * @param pipelineId Pipeline identifier
   * @returns Dashboard data with typed metrics
   * @cache 30 seconds (backend configured)
   */
  static async getDashboard(
    pipelineId: number
  ): Promise<PipelineDynamicDashboardDTO> {
    try {
      const response = await axiosInstance.get<PipelineDynamicDashboardDTO>(
        `${BASE_URL}/${pipelineId}/dashboard`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch dashboard for pipeline ${pipelineId}:`, error);
      throw error;
    }
  }

  /**
   * Get health metrics only for a pipeline
   * Lighter than full dashboard
   * 
   * @param pipelineId Pipeline identifier
   * @returns Health status and metrics
   */
  static async getPipelineHealth(
    pipelineId: number
  ): Promise<PipelineHealthDTO> {
    try {
      const dashboard = await this.getDashboard(pipelineId);
      
      // Extract health-related fields
      return {
        overallHealth: dashboard.overallHealth,
        healthScore: dashboard.healthScore,
        activeAlertsCount: dashboard.activeAlertsCount,
        criticalAlertsCount: dashboard.criticalAlertsCount,
        warningAlertsCount: dashboard.warningAlertsCount,
        currentPressure: dashboard.keyMetrics?.pressure,
        currentTemperature: dashboard.keyMetrics?.temperature,
        currentFlowRate: dashboard.keyMetrics?.flowRate,
        lastReadingTime: dashboard.latestReading?.recordedAt,
        avgPressureLast24h: dashboard.avgPressureLast24h,
        throughputLast24h: dashboard.throughputLast24h,
        eventsLast7Days: dashboard.eventsLast7Days,
        pressureStatus: dashboard.pressureStatus,
        temperatureStatus: dashboard.temperatureStatus,
        flowRateStatus: dashboard.flowRateStatus,
        availabilityPercent: 99.5, // TODO: Calculate from dashboard data
        sensorOnlinePercent: dashboard.sensorOnlinePercent,
      };
    } catch (error) {
      console.error(`Failed to fetch health for pipeline ${pipelineId}:`, error);
      throw error;
    }
  }

  /**
   * Force refresh dashboard (bypass cache)
   * 
   * @param pipelineId Pipeline identifier
   * @returns Fresh dashboard data
   */
  static async refreshDashboard(
    pipelineId: number
  ): Promise<PipelineDynamicDashboardDTO> {
    try {
      const response = await axiosInstance.get<PipelineDynamicDashboardDTO>(
        `${BASE_URL}/${pipelineId}/dashboard`,
        {
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to refresh dashboard for pipeline ${pipelineId}:`, error);
      throw error;
    }
  }

  /**
   * Check if key metrics are available
   * 
   * @param dashboard Dashboard data
   * @returns true if metrics exist and have values
   */
  static hasKeyMetrics(dashboard: PipelineDynamicDashboardDTO): boolean {
    if (!dashboard.keyMetrics) return false;
    
    return (
      dashboard.keyMetrics.pressure !== undefined ||
      dashboard.keyMetrics.temperature !== undefined ||
      dashboard.keyMetrics.flowRate !== undefined ||
      dashboard.keyMetrics.containedVolume !== undefined
    );
  }

  /**
   * Get health status color for UI
   * 
   * @param status Health status
   * @returns Color code for status indicator
   */
  static getHealthStatusColor(status: string): string {
    switch (status) {
      case 'HEALTHY':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  }

  /**
   * Get metric status color for UI
   * 
   * @param status Metric status
   * @returns Color code for status indicator
   */
  static getMetricStatusColor(status: string): string {
    switch (status) {
      case 'NORMAL':
        return 'success';
      case 'LOW':
      case 'HIGH':
        return 'warning';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  }
}
