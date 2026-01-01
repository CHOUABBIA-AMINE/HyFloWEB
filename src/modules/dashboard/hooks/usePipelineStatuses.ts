/**
 * Custom Hook: usePipelineStatuses
 * 
 * Fetches and manages pipeline status data
 */

import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import { PipelineStatus } from '../types/dashboard.types';

interface UsePipelineStatusesProps {
  date?: string;
  autoRefresh?: boolean;
}

export const usePipelineStatuses = ({ date, autoRefresh = true }: UsePipelineStatusesProps = {}) => {
  const [data, setData] = useState<PipelineStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statuses = await dashboardService.getPipelineStatuses(date);
      setData(statuses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline statuses');
      console.error('Error fetching pipeline statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [date, autoRefresh]);

  return { data, loading, error, refetch: fetchData };
};
