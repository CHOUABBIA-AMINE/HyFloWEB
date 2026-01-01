/**
 * Dashboard Module - TypeScript Types
 * 
 * Defines interfaces for dashboard data structures
 * matching backend DTOs
 */

export interface DashboardSummary {
  totalStations: number;
  totalTerminals: number;
  totalFields: number;
  totalPipelines: number;
  currentDate: string;
  totalVolumeToday: number;
  averagePressureToday: number;
  activePipelines: number;
  totalReadingsToday: number;
  expectedReadingsToday: number;
  totalTransportedToday: number;
  totalEstimatedToday: number;
  varianceToday: number;
  variancePercentToday: number;
  pipelinesOnTarget: number;
  pipelinesBelowTarget: number;
  pipelinesAboveTarget: number;
  pipelinesOffline: number;
  lastReadingTime: string;
  nextReadingTime: string;
  currentDayOfMonth: number;
  monthlyTotalTransported: number;
  monthlyTotalEstimated: number;
  monthlyVariance: number;
  monthlyVariancePercent: number;
  daysOnTargetThisMonth: number;
}

export interface PipelineStatus {
  pipelineId: number;
  pipelineCode: string;
  pipelineName: string;
  measurementDate: string;
  lastReadingTime: string | null;
  lastVolume: number | null;
  lastPressure: number | null;
  dailyVolumeTransported: number;
  dailyVolumeEstimated: number | null;
  dailyVariance: number | null;
  dailyVariancePercent: number | null;
  dailyProgress: number | null;
  averagePressureToday: number;
  minPressureToday: number;
  maxPressureToday: number;
  volumeStatus: 'ON_TARGET' | 'BELOW_TARGET' | 'ABOVE_TARGET' | 'OFFLINE';
  pressureStatus: 'NORMAL' | 'LOW' | 'HIGH' | 'OFFLINE';
  readingsCompletedToday: number;
  readingsExpectedToday: number;
}

export interface DailyTrend {
  date: string;
  totalVolumeTransported: number;
  totalVolumeEstimated: number;
  variance: number;
  variancePercent: number;
  averagePressure: number;
  activePipelines: number;
}

export type VolumeStatus = 'ON_TARGET' | 'BELOW_TARGET' | 'ABOVE_TARGET' | 'OFFLINE';
export type PressureStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'OFFLINE';
