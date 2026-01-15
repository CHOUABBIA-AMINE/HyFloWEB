/**
 * useMapFilters Hook
 * Custom hook for managing map layer visibility filters
 * 
 * Updated: 01-16-2026 - Renamed showHydrocarbonFields to showProductionFields
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 01-16-2026
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
    showProductionFields: true,
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
      showProductionFields: value,
      showPipelines: value
    });
  };

  return {
    filters,
    toggleFilter,
    setAllFilters
  };
};
