/**
 * Pipeline Dashboard Example Component
 * 
 * @author CHOUABBIA Amine
 * @created 02-14-2026
 * @updated 02-14-2026
 * 
 * @description Example component demonstrating proper usage of:
 *              - usePipelineDashboard hook
 *              - KeyMetricsDTO typed access
 *              - Health status indicators
 *              - Auto-refresh functionality
 */

import React from 'react';
import { usePipelineDashboard } from '../hooks';
import { PipelineIntelligenceService } from '../services';
import type { KeyMetricsDTO } from '../dto';

interface PipelineDashboardExampleProps {
  pipelineId: number;
}

/**
 * Example Dashboard Component
 * Demonstrates best practices for using typed metrics
 */
export const PipelineDashboardExample: React.FC<PipelineDashboardExampleProps> = ({
  pipelineId,
}) => {
  const { dashboard, isLoading, error, refresh, isRefetching, hasMetrics } =
    usePipelineDashboard(pipelineId, {
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
    });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={refresh}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // No data
  if (!dashboard) {
    return (
      <div className="text-center p-8 text-gray-500">
        No dashboard data available
      </div>
    );
  }

  // Helper function to render metric card
  const renderMetricCard = (
    label: string,
    value: number | undefined,
    unit: string,
    status?: string
  ) => {
    const statusColor = status
      ? PipelineIntelligenceService.getMetricStatusColor(status)
      : 'default';

    return (
      <div className="bg-white rounded-lg shadow p-4 border-l-4" 
           style={{ borderLeftColor: getColorCode(statusColor) }}>
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900">
          {value !== undefined ? `${value} ${unit}` : 'N/A'}
        </div>
        {status && (
          <div className="text-xs mt-2 font-medium" style={{ color: getColorCode(statusColor) }}>
            {status}
          </div>
        )}
      </div>
    );
  };

  const getColorCode = (color: string): string => {
    switch (color) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Extract typed metrics
  const metrics: KeyMetricsDTO | undefined = dashboard.keyMetrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {dashboard.pipelineName}
          </h2>
          <p className="text-sm text-gray-600">Pipeline ID: {dashboard.pipelineId}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isRefetching && (
            <span className="text-sm text-blue-600 flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
              Refreshing...
            </span>
          )}
          <button
            onClick={refresh}
            disabled={isRefetching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Health Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Health Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold" 
                 style={{ color: getColorCode(PipelineIntelligenceService.getHealthStatusColor(dashboard.overallHealth)) }}>
              {dashboard.overallHealth}
            </div>
            <div className="text-sm text-gray-600 mt-1">Overall Status</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.healthScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Health Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {dashboard.criticalAlertsCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Critical Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {dashboard.warningAlertsCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Warnings</div>
          </div>
        </div>
      </div>

      {/* Key Metrics - TYPED ACCESS */}
      {hasMetrics && metrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Current Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ✅ Type-safe access with KeyMetricsDTO */}
            {renderMetricCard(
              'Pressure',
              metrics.pressure,
              'bar',
              dashboard.pressureStatus
            )}
            {renderMetricCard(
              'Temperature',
              metrics.temperature,
              '°C',
              dashboard.temperatureStatus
            )}
            {renderMetricCard(
              'Flow Rate',
              metrics.flowRate,
              'm³/h',
              dashboard.flowRateStatus
            )}
            {renderMetricCard(
              'Contained Volume',
              metrics.containedVolume,
              'm³'
            )}
          </div>
        </div>
      )}

      {/* 24-Hour Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">24-Hour Averages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderMetricCard(
            'Avg Pressure',
            dashboard.avgPressureLast24h,
            'bar'
          )}
          {renderMetricCard(
            'Avg Temperature',
            dashboard.avgTemperatureLast24h,
            '°C'
          )}
          {renderMetricCard(
            'Avg Flow Rate',
            dashboard.avgFlowRateLast24h,
            'm³/h'
          )}
        </div>
      </div>

      {/* Data Quality */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Data Quality</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Completeness</div>
            <div className="text-2xl font-bold text-gray-900">
              {dashboard.dataCompletenessPercent.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Validated Today</div>
            <div className="text-2xl font-bold text-green-600">
              {dashboard.validatedReadingsToday}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Pending Validation</div>
            <div className="text-2xl font-bold text-yellow-600">
              {dashboard.pendingReadingsToday}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center">
        Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
