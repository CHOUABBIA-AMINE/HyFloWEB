/**
 * usePipelineDashboard Hook
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description React hook for managing pipeline dashboard data.
 *              Provides auto-refresh, caching, and loading states.
 *              Uses standard React patterns (useState/useEffect).
 */

import { useState, useEffect, useCallback } from 'react';
import { PipelineIntelligenceService } from '../services';
import type { PipelineDynamicDashboardDTO } from '../dto';

export interface UsePipelineDashboardOptions {
  /**
   * Enable auto-refresh
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refreshInterval?: number;

  /**
   * Enable query on mount
   * @default true
   */
  enabled?: boolean;
}

export interface UsePipelineDashboardReturn {
  dashboard?: PipelineDynamicDashboardDTO;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  refresh: () => void;
  hasMetrics: boolean;
}

/**
 * Hook for fetching and managing pipeline dashboard data
 * 
 * Features:
 * - Automatic fetching on mount
 * - Auto-refresh capability
 * - Loading and error states
 * - Typed response with KeyMetricsDTO
 * 
 * @param pipelineId Pipeline identifier
 * @param options Configuration options
 * @returns Dashboard data and control functions
 * 
 * @example
 * ```tsx
 * const { dashboard, isLoading, error, refresh } = usePipelineDashboard(1);
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <DashboardView 
 *     data={dashboard}
 *     metrics={dashboard.keyMetrics}
 *     onRefresh={refresh}
 *   />
 * );
 * ```
 */
export function usePipelineDashboard(
  pipelineId: number,
  options: UsePipelineDashboardOptions = {}
): UsePipelineDashboardReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds (matches backend cache)
    enabled = true,
  } = options;

  const [dashboard, setDashboard] = useState<PipelineDynamicDashboardDTO | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);

  const fetchDashboard = useCallback(async (isRefresh: boolean = false) => {
    if (!enabled) return;

    try {
      if (isRefresh) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);
      setError(null);

      const data = await PipelineIntelligenceService.getDashboard(pipelineId);
      setDashboard(data);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard'));
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [pipelineId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    const intervalId = setInterval(() => {
      fetchDashboard(true);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, enabled, refreshInterval, fetchDashboard]);

  const refresh = useCallback(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  const hasMetrics = dashboard
    ? PipelineIntelligenceService.hasKeyMetrics(dashboard)
    : false;

  return {
    dashboard,
    isLoading,
    isError,
    error,
    isRefetching,
    refresh,
    hasMetrics,
  };
}
