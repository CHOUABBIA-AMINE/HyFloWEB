/**
 * Flow Threshold DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowThresholdDTO
 * Updated: 01-25-2026 - Aligned with backend using FacilityDTO template
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { PipelineDTO } from '../../../network/core/dto/PipelineDTO';
import { ProductDTO } from '../../../network/common/dto/ProductDTO';

export interface FlowThresholdDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Pressure thresholds (bar)
  pressureMin: number;  // @NotNull, @PositiveOrZero (required)
  pressureMax: number;  // @NotNull, @DecimalMax(500.0) (required)
  
  // Temperature thresholds (°C)
  temperatureMin: number; // @NotNull, @DecimalMin(-50.0) (required)
  temperatureMax: number; // @NotNull, @DecimalMax(200.0) (required)
  
  // Flow rate thresholds (m³/h)
  flowRateMin: number;  // @NotNull, @PositiveOrZero (required)
  flowRateMax: number;  // @NotNull, @PositiveOrZero (required)
  
  // Alert configuration
  alertTolerance: number; // @NotNull, @DecimalMin(0.0), @DecimalMax(50.0) (required, 0-50%)
  active: boolean;        // @NotNull (required)
  
  // Required relationships (IDs)
  pipelineId: number;  // @NotNull (required)
  productId: number;   // @NotNull (required)
  
  // Nested objects (populated in responses)
  pipeline?: PipelineDTO;
  product?: ProductDTO;
}

/**
 * Validates FlowThresholdDTO according to backend constraints
 * @param data - Partial flow threshold data to validate
 * @returns Array of validation error messages
 */
export const validateFlowThresholdDTO = (data: Partial<FlowThresholdDTO>): string[] => {
  const errors: string[] = [];
  
  // Pressure min validation
  if (data.pressureMin === undefined || data.pressureMin === null) {
    errors.push('Minimum pressure is required');
  } else if (data.pressureMin < 0) {
    errors.push('Minimum pressure must be zero or positive');
  }
  
  // Pressure max validation
  if (data.pressureMax === undefined || data.pressureMax === null) {
    errors.push('Maximum pressure is required');
  } else if (data.pressureMax > 500) {
    errors.push('Maximum pressure exceeds absolute limit (500 bar)');
  }
  
  // Pressure range validation
  if (data.pressureMin !== undefined && data.pressureMax !== undefined && data.pressureMin >= data.pressureMax) {
    errors.push('Minimum pressure must be less than maximum pressure');
  }
  
  // Temperature min validation
  if (data.temperatureMin === undefined || data.temperatureMin === null) {
    errors.push('Minimum temperature is required');
  } else if (data.temperatureMin < -50) {
    errors.push('Minimum temperature below absolute limit (-50°C)');
  }
  
  // Temperature max validation
  if (data.temperatureMax === undefined || data.temperatureMax === null) {
    errors.push('Maximum temperature is required');
  } else if (data.temperatureMax > 200) {
    errors.push('Maximum temperature exceeds absolute limit (200°C)');
  }
  
  // Temperature range validation
  if (data.temperatureMin !== undefined && data.temperatureMax !== undefined && data.temperatureMin >= data.temperatureMax) {
    errors.push('Minimum temperature must be less than maximum temperature');
  }
  
  // Flow rate min validation
  if (data.flowRateMin === undefined || data.flowRateMin === null) {
    errors.push('Minimum flow rate is required');
  } else if (data.flowRateMin < 0) {
    errors.push('Minimum flow rate must be zero or positive');
  }
  
  // Flow rate max validation
  if (data.flowRateMax === undefined || data.flowRateMax === null) {
    errors.push('Maximum flow rate is required');
  } else if (data.flowRateMax < 0) {
    errors.push('Maximum flow rate must be positive');
  }
  
  // Flow rate range validation
  if (data.flowRateMin !== undefined && data.flowRateMax !== undefined && data.flowRateMin >= data.flowRateMax) {
    errors.push('Minimum flow rate must be less than maximum flow rate');
  }
  
  // Alert tolerance validation
  if (data.alertTolerance === undefined || data.alertTolerance === null) {
    errors.push('Alert tolerance is required');
  } else {
    if (data.alertTolerance < 0) {
      errors.push('Alert tolerance cannot be negative');
    } else if (data.alertTolerance > 50) {
      errors.push('Alert tolerance cannot exceed 50%');
    }
  }
  
  // Active status validation
  if (data.active === undefined || data.active === null) {
    errors.push('Active status is required');
  }
  
  // Pipeline validation
  if (data.pipelineId === undefined || data.pipelineId === null) {
    errors.push('Pipeline is required');
  }
  
  // Product validation
  if (data.productId === undefined || data.productId === null) {
    errors.push('Product is required');
  }
  
  return errors;
};

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
