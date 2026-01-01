/**
 * Custom Hook: useDashboardData
 * 
 * Fetches and manages dashboard summary data
 */

import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import { DashboardSummary } from '../types/dashboard.types';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchData };
};
