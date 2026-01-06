/**
 * Pipeline Filter Types
 * Type definitions for pipeline map filtering
 * 
 * @author CHOUABBIA Amine
 * @created 01-06-2026
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
export const DEFAULT_PRODUCT_COLORS: ProductColorMap = {
  // GN (Natural Gas) - YELLOW
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
  
  // PB (Pétrole Brut / Crude) - BLACK
  'PB': '#000000',
  'pb': '#000000',
  'PETROLE_BRUT': '#000000',
  'petrole_brut': '#000000',
  'PETROLE BRUT': '#000000',
  'Pétrole Brut': '#000000',
  'CRUDE': '#000000',
  'crude': '#000000',
  'CRUDE_OIL': '#000000',
  'crude_oil': '#000000',
  'CRUDE OIL': '#000000',
  'OIL': '#000000',
  'oil': '#000000',
  'BRUT': '#000000',
  'brut': '#000000',
  
  // GPL - GREEN
  'GPL': '#00C853',
  'gpl': '#00C853',
  'LPG': '#00C853',
  'lpg': '#00C853',
  
  // COND (Condensate) - PURPLE
  'COND': '#9C27B0',
  'cond': '#9C27B0',
  'CONDENSATE': '#9C27B0',
  'condensate': '#9C27B0',
  'CONDENSAT': '#9C27B0',
  'condensat': '#9C27B0',
  
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

  // GN - YELLOW
  if (normalized === 'gn' || normalized.includes('naturalgas') || normalized.includes('gaz') || normalized.includes('gas')) {
    return DEFAULT_PRODUCT_COLORS['GN'];
  }

  // PB - BLACK
  if (normalized === 'pb' || normalized.includes('petrolebrut') || normalized.includes('crud') || normalized.includes('oil') || normalized.includes('brut')) {
    return DEFAULT_PRODUCT_COLORS['PB'];
  }

  // GPL - GREEN
  if (normalized === 'gpl' || normalized.includes('lpg')) {
    return DEFAULT_PRODUCT_COLORS['GPL'];
  }

  // COND - PURPLE
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
