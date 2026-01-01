/**
 * useMapData Hook
 * Custom hook for fetching and managing map infrastructure data
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-24-2025
 */

import { useState, useEffect } from 'react';
import { geoService } from '../services';
import { InfrastructureData } from '../types';

interface UseMapDataResult {
  data: InfrastructureData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useMapData = (): UseMapDataResult => {
  const [data, setData] = useState<InfrastructureData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useMapData - Fetching infrastructure data...');
      
      const result = await geoService.getAllInfrastructure();
      
      console.log('useMapData - Raw result:', result);
      console.log('useMapData - Stations count:', result.stations?.length || 0);
      console.log('useMapData - Terminals count:', result.terminals?.length || 0);
      console.log('useMapData - Hydrocarbon Fields count:', result.hydrocarbonFields?.length || 0);
      
      // Log first item of each type if exists
      if (result.stations && result.stations.length > 0) {
        console.log('useMapData - First station:', result.stations[0]);
      } else {
        console.log('useMapData - No stations found');
      }
      
      if (result.terminals && result.terminals.length > 0) {
        console.log('useMapData - First terminal:', result.terminals[0]);
      } else {
        console.log('useMapData - No terminals found');
      }
      
      if (result.hydrocarbonFields && result.hydrocarbonFields.length > 0) {
        console.log('useMapData - First hydrocarbon field:', result.hydrocarbonFields[0]);
      } else {
        console.log('useMapData - No hydrocarbon fields found');
      }
      
      setData(result);
    } catch (err) {
      console.error('useMapData - Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch map data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
