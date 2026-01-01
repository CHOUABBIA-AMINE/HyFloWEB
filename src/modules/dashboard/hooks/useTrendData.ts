/**
 * Custom Hook: useTrendData
 * 
 * Fetches and manages daily trend data for charts
 */

import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import { DailyTrend } from '../types/dashboard.types';

interface UseTrendDataProps {
  startDate?: string;
  endDate?: string;
  days?: number; // Number of days to fetch (default: 7)
}

export const useTrendData = ({ startDate, endDate, days = 7 }: UseTrendDataProps = {}) => {
  const [data, setData] = useState<DailyTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate dates if not provided
      let start = startDate;
      let end = endDate;
      
      if (!start || !end) {
        const today = new Date();
        end = today.toISOString().split('T')[0];
        const startDateObj = new Date(today);
        startDateObj.setDate(startDateObj.getDate() - (days - 1));
        start = startDateObj.toISOString().split('T')[0];
      }
      
      const trends = await dashboardService.getTrends(start, end);
      setData(trends);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trend data');
      console.error('Error fetching trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, days]);

  return { data, loading, error, refetch: fetchData };
};
