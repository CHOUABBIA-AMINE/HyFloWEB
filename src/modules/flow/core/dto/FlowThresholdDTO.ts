/**
 * Flow Threshold DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @updated 01-25-2026 - Fixed to match backend structure
 * @aligned Backend: FlowThresholdDTO.java (01-23-2026)
 * 
 * Pipeline operating thresholds configuration
 * Note: Backend does NOT use ParameterType - it has specific fields for each parameter
 */

import { PipelineDTO } from '../../../network/core/dto/PipelineDTO';
import { ProductDTO } from '../../../network/common/dto/ProductDTO';

export interface FlowThresholdDTO {
  id?: number;
  
  // Pressure thresholds (bar)
  pressureMin: number;  // Required, >= 0
  pressureMax: number;  // Required, max 500
  
  // Temperature thresholds (°C)
  temperatureMin: number; // Required, min -50
  temperatureMax: number; // Required, max 200
  
  // Flow rate thresholds (m³/h)
  flowRateMin: number;  // Required, >= 0
  flowRateMax: number;  // Required, > 0
  
  // Alert configuration
  alertTolerance: number; // Required, 0-50% (tolerance for deviation)
  active: boolean;        // Required, is this threshold active
  
  // Foreign Keys
  pipelineId: number;  // Required
  productId: number;   // Required
  
  // Nested objects (for read operations)
  pipeline?: PipelineDTO;
  product?: ProductDTO;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create flow threshold request DTO
 */
export interface CreateFlowThresholdDTO {
  pressureMin: number;
  pressureMax: number;
  temperatureMin: number;
  temperatureMax: number;
  flowRateMin: number;
  flowRateMax: number;
  alertTolerance: number; // 0-50%
  active: boolean;
  pipelineId: number;
  productId: number;
}

/**
 * Update flow threshold request DTO
 */
export interface UpdateFlowThresholdDTO extends Partial<CreateFlowThresholdDTO> {}

/**
 * Flow threshold validation constraints
 */
export const FlowThresholdConstraints = {
  pressure: {
    min: 0,
    max: 500,
    unit: 'bar',
  },
  temperature: {
    min: -50,
    max: 200,
    unit: '°C',
  },
  flowRate: {
    min: 0,
    unit: 'm³/h',
  },
  alertTolerance: {
    min: 0,
    max: 50,
    unit: '%',
  },
};

/**
 * Helper to validate threshold ranges
 */
export const validateThresholdRange = (min: number, max: number, paramName: string): string | null => {
  if (min >= max) {
    return `${paramName} minimum (${min}) must be less than maximum (${max})`;
  }
  return null;
};
