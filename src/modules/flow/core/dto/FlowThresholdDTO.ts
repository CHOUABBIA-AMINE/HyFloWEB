/**
 * Flow Threshold DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: FlowThresholdDTO.java (01-23-2026)
 * 
 * Flow threshold configuration for monitoring limits
 */

import { SeverityDTO } from '../../common/dto/SeverityDTO';
import { PipelineDTO } from '../../../network/core/dto/PipelineDTO';
import { ParameterTypeDTO } from '../../type/dto/ParameterTypeDTO';

export interface FlowThresholdDTO {
  id?: number;
  
  // Threshold configuration
  minValue?: number; // Minimum acceptable value
  maxValue?: number; // Maximum acceptable value
  effectiveFrom: string; // ISO 8601 Date, required
  effectiveTo?: string; // ISO 8601 Date
  notes?: string; // Max 500 characters
  
  // Foreign Keys
  pipelineId: number; // Required
  parameterTypeId: number; // Required (e.g., PRESSURE, TEMPERATURE, FLOW_RATE)
  severityId: number; // Required
  
  // Nested objects
  pipeline?: PipelineDTO;
  parameterType?: ParameterTypeDTO;
  severity?: SeverityDTO;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlowThresholdDTO {
  minValue?: number;
  maxValue?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  notes?: string;
  pipelineId: number;
  parameterTypeId: number;
  severityId: number;
}

/**
 * Common parameter types for thresholds
 */
export enum ParameterType {
  PRESSURE = 'PRESSURE',
  TEMPERATURE = 'TEMPERATURE',
  FLOW_RATE = 'FLOW_RATE',
  VOLUME = 'VOLUME',
}
