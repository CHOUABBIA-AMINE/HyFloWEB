/**
 * Pipeline Filter Types
 * Type definitions for pipeline map filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 01-06-2026 - Updated color scheme per requirements
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

// Product color mapping with multiple formats
export const DEFAULT_PRODUCT_COLORS: ProductColorMap = {
  // Natural Gas (GN) - YELLOW
  'GN': '#FFD700',
  'gn': '#FFD700',
  'NATURAL_GAS': '#FFD700',
  'natural_gas': '#FFD700',
  'NATURAL GAS': '#FFD700',
  'Natural Gas': '#FFD700',
  'GAS': '#FFD700',
  'gas': '#FFD700',
  'GAZ': '#FFD700',
  'gaz': '#FFD700',
  'METHANE': '#FFD700',
  'methane': '#FFD700',
  
  // Crude Oil - BLACK
  'CRUDE': '#000000',
  'crude': '#000000',
  'CRUDE_OIL': '#000000',
  'crude_oil': '#000000',
  'CRUDE OIL': '#000000',
  'Crude Oil': '#000000',
  'OIL': '#000000',
  'oil': '#000000',
  'PETROLE': '#000000',
  'petrole': '#000000',
  'BRUT': '#000000',
  'brut': '#000000',
  
  // GPL (LPG) - GREEN
  'GPL': '#00C853',
  'gpl': '#00C853',
  'LPG': '#00C853',
  'lpg': '#00C853',
  'PROPANE': '#00C853',
  'propane': '#00C853',
  'BUTANE': '#00C853',
  'butane': '#00C853',
  
  // Condensate - PURPLE
  'CONDENSATE': '#9C27B0',
  'condensate': '#9C27B0',
  'CONDENSAT': '#9C27B0',
  'condensat': '#9C27B0',
  
  // Refined products - ORANGE (fallback for diesel, petrol, etc.)
  'REFINED': '#FF6F00',
  'refined': '#FF6F00',
  'RAFFINÉ': '#FF6F00',
  'raffiné': '#FF6F00',
  'PETROL': '#FF6F00',
  'petrol': '#FF6F00',
  'DIESEL': '#FF6F00',
  'diesel': '#FF6F00',
  
  // Mixed - BROWN
  'MIXED': '#795548',
  'mixed': '#795548',
  'MIXTE': '#795548',
  'mixte': '#795548',
  
  // Other/Unknown - GRAY
  'OTHER': '#9E9E9E',
  'other': '#9E9E9E',
  'AUTRE': '#9E9E9E',
  'autre': '#9E9E9E',
  'UNKNOWN': '#9E9E9E',
  'unknown': '#9E9E9E',
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
  
  // Try fuzzy matching with normalized string
  const normalized = productCode.toLowerCase().replace(/[_\s-]/g, '');
  
  // Natural Gas (GN) - YELLOW
  if (normalized.includes('gn') || normalized.includes('gas') || normalized.includes('gaz') || normalized.includes('methane')) {
    return DEFAULT_PRODUCT_COLORS['GN'];
  }
  
  // Crude Oil - BLACK
  if (normalized.includes('crude') || normalized.includes('oil') || normalized.includes('petrole') || normalized.includes('brut')) {
    return DEFAULT_PRODUCT_COLORS['CRUDE'];
  }
  
  // GPL - GREEN
  if (normalized.includes('gpl') || normalized.includes('lpg') || normalized.includes('propane') || normalized.includes('butane')) {
    return DEFAULT_PRODUCT_COLORS['GPL'];
  }
  
  // Condensate - PURPLE
  if (normalized.includes('condensat')) {
    return DEFAULT_PRODUCT_COLORS['CONDENSATE'];
  }
  
  // Refined - ORANGE
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
