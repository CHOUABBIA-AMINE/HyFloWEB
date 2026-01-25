/**
 * Flow Forecast DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: FlowForecastDTO.java (01-23-2026)
 * 
 * Flow forecast for planning purposes
 */

import { ValidationStatusDTO } from '../../common/dto/ValidationStatusDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { ProductDTO } from '../../../network/common/dto/ProductDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';

export interface FlowForecastDTO {
  id?: number;
  
  // Forecast data
  forecastDate: string; // ISO 8601 Date, required, future
  estimatedVolume: number; // Required, >= 0
  confidence?: number; // Confidence percentage (0-100)
  validatedAt?: string; // ISO 8601 DateTime
  notes?: string; // Max 500 characters
  
  // Foreign Keys
  infrastructureId: number; // Required
  productId: number; // Required
  createdById: number; // Required
  validatedById?: number;
  validationStatusId: number; // Required
  
  // Nested objects
  infrastructure?: InfrastructureDTO;
  product?: ProductDTO;
  createdBy?: EmployeeDTO;
  validatedBy?: EmployeeDTO;
  validationStatus?: ValidationStatusDTO;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlowForecastDTO {
  forecastDate: string;
  estimatedVolume: number;
  confidence?: number;
  notes?: string;
  infrastructureId: number;
  productId: number;
  createdById: number;
  validationStatusId: number;
}
