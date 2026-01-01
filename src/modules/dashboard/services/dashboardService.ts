/**
 * Dashboard Service
 * API service for dashboard data operations
 * 
 * @author CHOUABBIA Amine
 * @created 12-27-2025
 */

import axiosInstance from '../../../shared/config/axios';
import type { DashboardSummary, PipelineStatus, DailyTrend } from '../types/dashboard.types';

/**
 * Get dashboard summary data
 */
export const getSummary = async (date?: string): Promise<DashboardSummary> => {
  const params = date ? { date } : {};
  const response = await axiosInstance.get<DashboardSummary>(
    '/network/flow/dashboard/summary',
    { params }
  );
  return response.data;
};

/**
 * Get all pipeline statuses
 */
export const getPipelineStatuses = async (date?: string): Promise<PipelineStatus[]> => {
  const params = date ? { date } : {};
  const response = await axiosInstance.get<PipelineStatus[]>(
    '/network/flow/dashboard/pipelines',
    { params }
  );
  return response.data;
};

/**
 * Get specific pipeline status by ID
 */
export const getPipelineStatus = async (
  id: number,
  date?: string
): Promise<PipelineStatus> => {
  const params = date ? { date } : {};
  const response = await axiosInstance.get<PipelineStatus>(
    `/network/flow/dashboard/pipeline/${id}`,
    { params }
  );
  return response.data;
};

/**
 * Get daily trend data
 */
export const getTrends = async (
  startDate?: string,
  endDate?: string,
  days: number = 7
): Promise<DailyTrend[]> => {
  const params: Record<string, string | number> = { days };
  
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await axiosInstance.get<DailyTrend[]>(
    '/network/flow/dashboard/trends',
    { params }
  );
  return response.data;
};

export default {
  getSummary,
  getPipelineStatuses,
  getPipelineStatus,
  getTrends,
};
