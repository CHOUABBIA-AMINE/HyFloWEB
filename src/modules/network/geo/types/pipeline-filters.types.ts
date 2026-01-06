/**
 * Pipeline Filter Types
 * Type definitions for pipeline map filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 */

export interface PipelineFilters {
  products: string[];           // Selected product types
  statuses: string[];          // Selected operational statuses
  searchCode: string;          // Pipeline code search
  showLabels: boolean;         // Show pipeline labels
  showDirection: boolean;      // Show flow direction arrows
}

export interface ProductColorMap {
  [productCode: string]: string;
}

export const DEFAULT_PRODUCT_COLORS: ProductColorMap = {
  'CRUDE_OIL': '#2C3E50',        // Dark blue-gray
  'NATURAL_GAS': '#E74C3C',      // Red
  'CONDENSATE': '#F39C12',       // Orange
  'LPG': '#9B59B6',              // Purple
  'REFINED': '#27AE60',          // Green
  'MIXED': '#34495E',            // Gray-blue
  'OTHER': '#95A5A6',            // Light gray
};

export const DEFAULT_STATUS_COLORS = {
  'OPERATIONAL': '#4CAF50',      // Green
  'MAINTENANCE': '#FF9800',      // Orange
  'INACTIVE': '#9E9E9E',         // Gray
  'CONSTRUCTION': '#2196F3',     // Blue
};

export interface PipelineFilterState {
  availableProducts: string[];   // All unique products in data
  availableStatuses: string[];   // All unique statuses in data
  filters: PipelineFilters;
}
