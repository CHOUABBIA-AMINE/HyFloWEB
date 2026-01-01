/**
 * Station DTO
 * Data Transfer Object for Station entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-23-2025
 */

import { VendorDTO } from '../../common/dto';
import { OperationalStatusDTO } from '../../common/dto';
import { StationTypeDTO } from '../../type/dto';
import { PipelineSystemDTO } from './PipelineSystemDTO';
import { LocalityDTO } from '../../../common/administration/dto';

export interface StationDTO {
  id: number;
  name: string;
  code: string;
  description?: string;
  placeName: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // IDs for relations
  operationalStatusId: number;
  stationTypeId: number;
  pipelineSystemId?: number;
  vendorId: number;
  localityId: number;
  
  // Nested objects (from backend)
  operationalStatus?: OperationalStatusDTO;
  stationType?: StationTypeDTO;
  pipelineSystem?: PipelineSystemDTO;
  vendor?: VendorDTO;
  locality?: LocalityDTO;
  
  // Legacy string fields (fallback)
  operationalStatusName?: string;
  stationTypeName?: string;
  pipelineSystemName?: string;
  vendorName?: string;
  localityName?: string;
  
  pipelines?: any[];
  equipments?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StationCreateDTO {
  name: string;
  code: string;
  description?: string;
  placeName: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  operationalStatusId: number;
  stationTypeId: number;
  pipelineSystemId?: number;
  vendorId: number;
  localityId: number;
}

export interface StationUpdateDTO extends Partial<StationCreateDTO> {
  id: number;
}
