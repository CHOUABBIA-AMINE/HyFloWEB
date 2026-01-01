/**
 * useMapFilters Hook
 * Custom hook for managing map layer visibility filters
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-24-2025
 */

import { useState } from 'react';
import { MapFilters } from '../types';

interface UseMapFiltersResult {
  filters: MapFilters;
  toggleFilter: (filterKey: keyof MapFilters) => void;
  setAllFilters: (value: boolean) => void;
}

export const useMapFilters = (): UseMapFiltersResult => {
  const [filters, setFilters] = useState<MapFilters>({
    showStations: true,
    showTerminals: true,
    showHydrocarbonFields: true,
    showPipelines: true
  });

  const toggleFilter = (filterKey: keyof MapFilters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const setAllFilters = (value: boolean) => {
    setFilters({
      showStations: value,
      showTerminals: value,
      showHydrocarbonFields: value,
      showPipelines: value
    });
  };

  return {
    filters,
    toggleFilter,
    setAllFilters
  };
};
