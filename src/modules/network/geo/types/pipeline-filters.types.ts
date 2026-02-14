/**
 * Pipeline Filter Types
 * Type definitions for pipeline map filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
 * @updated 02-14-2026 21:37 - Updated colors: LPG=Blue, Gas=Red, Crude=Green, Condensate=Orange
 * @updated 01-06-2026 - Colors: GN yellow, PB black, GPL green, COND purple
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
// Updated 02-14-2026: LPG=Blue, Gas=Red, Crude=Green, Condensate=Orange
export const DEFAULT_PRODUCT_COLORS: ProductColorMap = {
  // GPL/LPG - BLUE
  'GPL': '#2196F3',
  'gpl': '#2196F3',
  'LPG': '#2196F3',
  'lpg': '#2196F3',
  
  // GN (Natural Gas) - RED
  'GN': '#F44336',
  'gn': '#F44336',
  'NATURAL_GAS': '#F44336',
  'natural_gas': '#F44336',
  'NATURAL GAS': '#F44336',
  'Natural Gas': '#F44336',
  'GAS': '#F44336',
  'gas': '#F44336',
  'GAZ': '#F44336',
  'gaz': '#F44336',
  
  // PB (Pétrole Brut / Crude) - GREEN
  'PB': '#4CAF50',
  'pb': '#4CAF50',
  'PETROLE_BRUT': '#4CAF50',
  'petrole_brut': '#4CAF50',
  'PETROLE BRUT': '#4CAF50',
  'Pétrole Brut': '#4CAF50',
  'CRUDE': '#4CAF50',
  'crude': '#4CAF50',
  'CRUDE_OIL': '#4CAF50',
  'crude_oil': '#4CAF50',
  'CRUDE OIL': '#4CAF50',
  'OIL': '#4CAF50',
  'oil': '#4CAF50',
  'BRUT': '#4CAF50',
  'brut': '#4CAF50',
  
  // COND (Condensate) - ORANGE
  'COND': '#FF9800',
  'cond': '#FF9800',
  'CONDENSATE': '#FF9800',
  'condensate': '#FF9800',
  'CONDENSAT': '#FF9800',
  'condensat': '#FF9800',
  
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
  if (DEFAULT_PRODUCT_COLORS[productCode]) return DEFAULT_PRODUCT_COLORS[productCode];

  // Case-insensitive match
  const lowerCode = productCode.toLowerCase();
  const upperCode = productCode.toUpperCase();
  if (DEFAULT_PRODUCT_COLORS[lowerCode]) return DEFAULT_PRODUCT_COLORS[lowerCode];
  if (DEFAULT_PRODUCT_COLORS[upperCode]) return DEFAULT_PRODUCT_COLORS[upperCode];

  // Normalized fuzzy match
  const normalized = productCode
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s-]/g, '');

  // GPL/LPG - BLUE
  if (normalized === 'gpl' || normalized.includes('lpg')) {
    return DEFAULT_PRODUCT_COLORS['GPL'];
  }

  // GN (Gas) - RED
  if (normalized === 'gn' || normalized.includes('naturalgas') || normalized.includes('gaz') || normalized.includes('gas')) {
    return DEFAULT_PRODUCT_COLORS['GN'];
  }

  // PB (Crude) - GREEN
  if (normalized === 'pb' || normalized.includes('petrolebrut') || normalized.includes('crud') || normalized.includes('oil') || normalized.includes('brut')) {
    return DEFAULT_PRODUCT_COLORS['PB'];
  }

  // COND (Condensate) - ORANGE
  if (normalized === 'cond' || normalized.includes('condensat')) {
    return DEFAULT_PRODUCT_COLORS['COND'];
  }

  console.warn(`No color mapping found for product code: "${productCode}". Using default gray.`);
  return DEFAULT_PRODUCT_COLORS['OTHER'];
};

export const DEFAULT_STATUS_COLORS = {
  'OPERATIONAL': '#4CAF50',
  'MAINTENANCE': '#FF9800',
  'INACTIVE': '#9E9E9E',
  'CONSTRUCTION': '#2196F3',
};

export interface PipelineFilterState {
  availableProducts: string[];
  availableStatuses: string[];
  filters: PipelineFilters;
}
