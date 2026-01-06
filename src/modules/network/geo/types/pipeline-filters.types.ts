/**
 * Pipeline Filter Types
 * Type definitions for pipeline map filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026 - Added flexible color mapping
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

// Extended color mapping with multiple formats (uppercase, lowercase, with spaces)
export const DEFAULT_PRODUCT_COLORS: ProductColorMap = {
  // Crude Oil variants
  'CRUDE_OIL': '#2C3E50',
  'crude_oil': '#2C3E50',
  'CRUDE OIL': '#2C3E50',
  'Crude Oil': '#2C3E50',
  'CRUDE': '#2C3E50',
  'crude': '#2C3E50',
  'OIL': '#2C3E50',
  'oil': '#2C3E50',
  
  // Natural Gas variants
  'NATURAL_GAS': '#E74C3C',
  'natural_gas': '#E74C3C',
  'NATURAL GAS': '#E74C3C',
  'Natural Gas': '#E74C3C',
  'GAS': '#E74C3C',
  'gas': '#E74C3C',
  'METHANE': '#E74C3C',
  'methane': '#E74C3C',
  
  // Condensate variants
  'CONDENSATE': '#F39C12',
  'condensate': '#F39C12',
  'CONDENSAT': '#F39C12',
  'condensat': '#F39C12',
  
  // LPG variants
  'LPG': '#9B59B6',
  'lpg': '#9B59B6',
  'GPL': '#9B59B6',
  'gpl': '#9B59B6',
  'PROPANE': '#9B59B6',
  'propane': '#9B59B6',
  'BUTANE': '#9B59B6',
  'butane': '#9B59B6',
  
  // Refined products
  'REFINED': '#27AE60',
  'refined': '#27AE60',
  'RAFFINÉ': '#27AE60',
  'raffiné': '#27AE60',
  'PETROL': '#27AE60',
  'petrol': '#27AE60',
  'DIESEL': '#27AE60',
  'diesel': '#27AE60',
  
  // Mixed
  'MIXED': '#34495E',
  'mixed': '#34495E',
  'MIXTE': '#34495E',
  'mixte': '#34495E',
  
  // Other/Unknown
  'OTHER': '#95A5A6',
  'other': '#95A5A6',
  'AUTRE': '#95A5A6',
  'autre': '#95A5A6',
  'UNKNOWN': '#95A5A6',
  'unknown': '#95A5A6',
};

/**
 * Get color for a product code with fuzzy matching
 */
export const getProductColor = (productCode: string | undefined | null): string => {
  if (!productCode) return DEFAULT_PRODUCT_COLORS['OTHER'];
  
  // Direct match
  if (DEFAULT_PRODUCT_COLORS[productCode]) {
    return DEFAULT_PRODUCT_COLORS[productCode];
  }
  
  // Try case-insensitive match
  const lowerCode = productCode.toLowerCase();
  const upperCode = productCode.toUpperCase();
  
  if (DEFAULT_PRODUCT_COLORS[lowerCode]) {
    return DEFAULT_PRODUCT_COLORS[lowerCode];
  }
  
  if (DEFAULT_PRODUCT_COLORS[upperCode]) {
    return DEFAULT_PRODUCT_COLORS[upperCode];
  }
  
  // Try fuzzy matching
  const normalized = productCode.toLowerCase().replace(/[_\s-]/g, '');
  
  if (normalized.includes('crude') || normalized.includes('oil') || normalized.includes('petrole') || normalized.includes('brut')) {
    return DEFAULT_PRODUCT_COLORS['CRUDE_OIL'];
  }
  
  if (normalized.includes('gas') || normalized.includes('gaz') || normalized.includes('methane')) {
    return DEFAULT_PRODUCT_COLORS['NATURAL_GAS'];
  }
  
  if (normalized.includes('condensat')) {
    return DEFAULT_PRODUCT_COLORS['CONDENSATE'];
  }
  
  if (normalized.includes('lpg') || normalized.includes('gpl') || normalized.includes('propane') || normalized.includes('butane')) {
    return DEFAULT_PRODUCT_COLORS['LPG'];
  }
  
  if (normalized.includes('refined') || normalized.includes('raffin') || normalized.includes('diesel') || normalized.includes('petrol')) {
    return DEFAULT_PRODUCT_COLORS['REFINED'];
  }
  
  // Default fallback
  console.warn(`No color mapping found for product code: "${productCode}". Using default gray.`);
  return DEFAULT_PRODUCT_COLORS['OTHER'];
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
