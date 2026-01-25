/**
 * Flow Event DTO
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 * @aligned Backend: FlowEventDTO.java (01-23-2026)
 * 
 * Flow event tracking operational incidents
 */

import { EventStatusDTO } from '../../common/dto/EventStatusDTO';
import { SeverityDTO } from '../../common/dto/SeverityDTO';
import { EmployeeDTO } from '../../../general/organization/dto/EmployeeDTO';
import { InfrastructureDTO } from '../../../network/core/dto/InfrastructureDTO';
import { EventTypeDTO } from '../../type/dto/EventTypeDTO';

export interface FlowEventDTO {
  id?: number;
  
  // Event data
  startTime: string; // ISO 8601 DateTime, required
  endTime?: string; // ISO 8601 DateTime
  title: string; // Required, max 200 characters
  description?: string; // Max 1000 characters
  impact?: string; // Max 500 characters
  resolution?: string; // Max 500 characters
  
  // Foreign Keys
  infrastructureId: number; // Required
  typeId: number; // Required (Event type)
  severityId: number; // Required
  statusId: number; // Required (Event status)
  reportedById: number; // Required
  resolvedById?: number;
  
  // Nested objects
  infrastructure?: InfrastructureDTO;
  type?: EventTypeDTO;
  severity?: SeverityDTO;
  status?: EventStatusDTO;
  reportedBy?: EmployeeDTO;
  resolvedBy?: EmployeeDTO;
  
  // Audit fields
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlowEventDTO {
  startTime: string;
  endTime?: string;
  title: string;
  description?: string;
  impact?: string;
  infrastructureId: number;
  typeId: number;
  severityId: number;
  statusId: number;
  reportedById: number;
}
