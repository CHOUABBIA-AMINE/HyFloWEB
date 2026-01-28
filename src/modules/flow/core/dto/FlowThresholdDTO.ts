/**
 * Flow Threshold DTO - Flow Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.core.dto.FlowThresholdDTO
 * 
 * Backend uses BigDecimal for all numeric fields and Boolean for active status.
 * Frontend handles these as numbers and booleans for form compatibility.
 * 
 * Backend Author: MEDJERAB Abir
 * Frontend Author: CHOUABBIA Amine
 * 
 * @created 01-23-2026 (Backend)
 * @updated 01-28-2026 (Frontend) - Added containedVolume Min/Max fields
 */

import { PipelineDTO } from '../../../network/core/dto/PipelineDTO';

export interface FlowThresholdDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Pressure thresholds (bar) - Backend: BigDecimal
  pressureMin: number;  // @NotNull, @PositiveOrZero (required)
  pressureMax: number;  // @NotNull, @DecimalMax(500.0) (required)
  
  // Temperature thresholds (°C) - Backend: BigDecimal
  temperatureMin: number; // @NotNull, @DecimalMin(-50.0) (required)
  temperatureMax: number; // @NotNull, @DecimalMax(200.0) (required)
  
  // Flow rate thresholds (m³/h) - Backend: BigDecimal
  flowRateMin: number;  // @NotNull, @PositiveOrZero (required)
  flowRateMax: number;  // @NotNull, @PositiveOrZero (required)
  
  // Contained volume thresholds (m³) - Backend: BigDecimal
  containedVolumeMin: number;  // @NotNull, @PositiveOrZero (required)
  containedVolumeMax: number;  // @NotNull, @PositiveOrZero (required)
  
  // Alert configuration - Backend: BigDecimal for tolerance, Boolean for active
  alertTolerance: number; // @NotNull, @DecimalMin(0.0), @DecimalMax(50.0) (required, 0-50%)
  active: boolean;        // @NotNull (required)
  
  // Required relationship (ID) - Backend: Long
  pipelineId: number;  // @NotNull (required)
  
  // Nested object (populated in responses)
  pipeline?: PipelineDTO;
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
  
  // Contained volume min validation
  if (data.containedVolumeMin === undefined || data.containedVolumeMin === null) {
    errors.push('Minimum contained volume is required');
  } else if (data.containedVolumeMin < 0) {
    errors.push('Minimum contained volume must be zero or positive');
  }
  
  // Contained volume max validation
  if (data.containedVolumeMax === undefined || data.containedVolumeMax === null) {
    errors.push('Maximum contained volume is required');
  } else if (data.containedVolumeMax < 0) {
    errors.push('Maximum contained volume must be positive');
  }
  
  // Contained volume range validation
  if (data.containedVolumeMin !== undefined && data.containedVolumeMax !== undefined && data.containedVolumeMin >= data.containedVolumeMax) {
    errors.push('Minimum contained volume must be less than maximum contained volume');
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
  if (data.pipelineId === undefined || data.pipelineId === null || data.pipelineId === 0) {
    errors.push('Pipeline is required');
  }
  
  return errors;
};

/**
 * Flow threshold validation constraints
 * Matches backend validation annotations
 */
export const FlowThresholdConstraints = {
  pressure: {
    min: 0,      // @PositiveOrZero
    max: 500,    // @DecimalMax("500.0")
    unit: 'bar',
    step: 0.1,
  },
  temperature: {
    min: -50,    // @DecimalMin("-50.0")
    max: 200,    // @DecimalMax("200.0")
    unit: '°C',
    step: 0.1,
  },
  flowRate: {
    min: 0,      // @PositiveOrZero
    unit: 'm³/h',
    step: 1,
  },
  containedVolume: {
    min: 0,      // @PositiveOrZero
    unit: 'm³',
    step: 1,
  },
  alertTolerance: {
    min: 0,      // @DecimalMin("0.0")
    max: 50,     // @DecimalMax("50.0")
    unit: '%',
    step: 0.5,
  },
};

/**
 * Type guard to check if threshold data is valid
 */
export const isValidFlowThreshold = (data: Partial<FlowThresholdDTO>): data is FlowThresholdDTO => {
  return validateFlowThresholdDTO(data).length === 0;
};

/**
 * Default values for creating a new threshold
 */
export const createDefaultFlowThreshold = (): Partial<FlowThresholdDTO> => ({
  pressureMin: 0,
  pressureMax: 100,
  temperatureMin: 0,
  temperatureMax: 100,
  flowRateMin: 0,
  flowRateMax: 1000,
  containedVolumeMin: 0,
  containedVolumeMax: 10000,
  alertTolerance: 5,
  active: true,
});
