/**
 * usePipelineFilters Hook
 * Hook for managing pipeline filtering state
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 */

import { useState, useCallback, useMemo } from 'react';
import { PipelineFilters, PipelineFilterState } from '../types/pipeline-filters.types';
import { PipelineGeoData } from '../types';

const DEFAULT_FILTERS: PipelineFilters = {
  products: [],
  statuses: [],
  searchCode: '',
  showLabels: true,
  showDirection: true,
};

export const usePipelineFilters = (pipelines: PipelineGeoData[]) => {
  const [filters, setFilters] = useState<PipelineFilters>(DEFAULT_FILTERS);

  // Extract unique products and statuses from pipeline data
  const { availableProducts, availableStatuses } = useMemo(() => {
    const products = new Set<string>();
    const statuses = new Set<string>();

    pipelines.forEach((pipelineData) => {
      const pipeline = pipelineData.pipeline;
      
      if (pipeline.product?.code) {
        products.add(pipeline.product.code);
      }
      
      if (pipeline.operationalStatus?.code) {
        statuses.add(pipeline.operationalStatus.code);
      }
    });

    return {
      availableProducts: Array.from(products).sort(),
      availableStatuses: Array.from(statuses).sort(),
    };
  }, [pipelines]);

  // Toggle product filter
  const toggleProduct = useCallback((product: string) => {
    setFilters((prev) => {
      const newProducts = prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product];
      
      return { ...prev, products: newProducts };
    });
  }, []);

  // Toggle status filter
  const toggleStatus = useCallback((status: string) => {
    setFilters((prev) => {
      const newStatuses = prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      
      return { ...prev, statuses: newStatuses };
    });
  }, []);

  // Set search code
  const setSearchCode = useCallback((code: string) => {
    setFilters((prev) => ({ ...prev, searchCode: code }));
  }, []);

  // Toggle display options
  const toggleLabels = useCallback(() => {
    setFilters((prev) => ({ ...prev, showLabels: !prev.showLabels }));
  }, []);

  const toggleDirection = useCallback(() => {
    setFilters((prev) => ({ ...prev, showDirection: !prev.showDirection }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Select/deselect all products
  const toggleAllProducts = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      products: prev.products.length === availableProducts.length ? [] : [...availableProducts],
    }));
  }, [availableProducts]);

  // Select/deselect all statuses
  const toggleAllStatuses = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.length === availableStatuses.length ? [] : [...availableStatuses],
    }));
  }, [availableStatuses]);

  // Filter pipelines based on current filters
  const filteredPipelines = useMemo(() => {
    return pipelines.filter((pipelineData) => {
      const pipeline = pipelineData.pipeline;

      // Product filter
      if (filters.products.length > 0) {
        const productCode = pipeline.product?.code;
        if (!productCode || !filters.products.includes(productCode)) {
          return false;
        }
      }

      // Status filter
      if (filters.statuses.length > 0) {
        const statusCode = pipeline.operationalStatus?.code;
        if (!statusCode || !filters.statuses.includes(statusCode)) {
          return false;
        }
      }

      // Search by code
      if (filters.searchCode) {
        const searchLower = filters.searchCode.toLowerCase();
        const code = pipeline.code?.toLowerCase() || '';
        const name = pipeline.name?.toLowerCase() || '';
        
        if (!code.includes(searchLower) && !name.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [pipelines, filters]);

  const state: PipelineFilterState = {
    availableProducts,
    availableStatuses,
    filters,
  };

  return {
    state,
    filteredPipelines,
    toggleProduct,
    toggleStatus,
    setSearchCode,
    toggleLabels,
    toggleDirection,
    resetFilters,
    toggleAllProducts,
    toggleAllStatuses,
  };
};
