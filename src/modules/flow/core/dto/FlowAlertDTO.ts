/**
 * Flow Alert DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: FlowAlertDTO.java (01-23-2026)
 * 
 * Flow alert for threshold violations and anomalies
 */

import { AlertStatusDTO } from '../../common/dto/AlertStatusDTO';
import { SeverityDTO } from '../../common/dto/SeverityDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { PipelineDTO } from '../../../network/core/dto/PipelineDTO';
import { FlowThresholdDTO } from './FlowThresholdDTO';

export interface FlowAlertDTO {
  id?: number;
  
  // Alert data
  triggeredAt: string; // ISO 8601 DateTime, required
  message: string; // Required, max 500 characters
  measuredValue?: number; // Actual measured value that triggered alert
  acknowledgedAt?: string; // ISO 8601 DateTime
  resolvedAt?: string; // ISO 8601 DateTime
  notes?: string; // Max 500 characters
  
  // Foreign Keys
  pipelineId: number; // Required
  thresholdId?: number;
  severityId: number; // Required
  statusId: number; // Required (Alert status)
  acknowledgedById?: number;
  resolvedById?: number;
  
  // Nested objects
  pipeline?: PipelineDTO;
  threshold?: FlowThresholdDTO;
  severity?: SeverityDTO;
  status?: AlertStatusDTO;
  acknowledgedBy?: EmployeeDTO;
  resolvedBy?: EmployeeDTO;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlowAlertDTO {
  triggeredAt: string;
  message: string;
  measuredValue?: number;
  notes?: string;
  pipelineId: number;
  thresholdId?: number;
  severityId: number;
  statusId: number;
}
