/**
 * usePipelineDashboard Hook
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description React hook for managing pipeline dashboard data.
 *              Provides auto-refresh, caching, and loading states.
 */

import { useQuery } from '@tanstack/react-query';
import { PipelineIntelligenceService } from '../services';
import type { PipelineDynamicDashboardDTO } from '../dto';

interface UsePipelineDashboardOptions {
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

interface UsePipelineDashboardReturn {
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
 * - 30-second cache (matches backend)
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

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['pipeline-dashboard', pipelineId],
    queryFn: () => PipelineIntelligenceService.getDashboard(pipelineId),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const hasMetrics = dashboard
    ? PipelineIntelligenceService.hasKeyMetrics(dashboard)
    : false;

  return {
    dashboard,
    isLoading,
    isError,
    error: error as Error | null,
    isRefetching,
    refresh: () => refetch(),
    hasMetrics,
  };
}
