/**
 * Pipeline DTO
 * Data Transfer Object for Pipeline entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-24-2025
 * @updated 12-24-2025
 */

import { VendorDTO } from '../../common/dto';
import { OperationalStatusDTO } from '../../common/dto';
import { PipelineSystemDTO } from './PipelineSystemDTO';
import { AlloyDTO } from '../../common/dto';
import { FacilityDTO } from './FacilityDTO';

export interface PipelineDTO {
  id: number;
  code: string;
  name: string;
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // Technical specifications
  nominalDiameter?: number;
  length?: number;
  nominalThickness?: number;
  nominalRoughness?: number;
  
  // Pressure specifications
  designMaxServicePressure?: number;
  operationalMaxServicePressure?: number;
  designMinServicePressure?: number;
  operationalMinServicePressure?: number;
  
  // Capacity specifications
  designCapacity?: number;
  operationalCapacity?: number;
  
  // Material and coating - now using Alloy IDs
  nominalConstructionMaterialId?: number;
  nominalExteriorCoatingId?: number;
  nominalInteriorCoatingId?: number;
  
  // Relations - IDs
  operationalStatusId: number;
  vendorId: number;
  pipelineSystemId?: number;
  departureFacilityId?: number;
  arrivalFacilityId?: number;
  
  // Nested objects (from backend)
  operationalStatus?: OperationalStatusDTO;
  vendor?: VendorDTO;
  pipelineSystem?: PipelineSystemDTO;
  nominalConstructionMaterial?: AlloyDTO;
  nominalExteriorCoating?: AlloyDTO;
  nominalInteriorCoating?: AlloyDTO;
  departureFacility?: FacilityDTO;
  arrivalFacility?: FacilityDTO;
  
  // Legacy string fields (fallback)
  operationalStatusName?: string;
  vendorName?: string;
  pipelineSystemName?: string;
  nominalConstructionMaterialName?: string;
  nominalExteriorCoatingName?: string;
  nominalInteriorCoatingName?: string;
  departureFacilityName?: string;
  arrivalFacilityName?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineCreateDTO {
  code: string;
  name: string;
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  nominalDiameter?: number;
  length?: number;
  nominalThickness?: number;
  nominalRoughness?: number;
  
  designMaxServicePressure?: number;
  operationalMaxServicePressure?: number;
  designMinServicePressure?: number;
  operationalMinServicePressure?: number;
  
  designCapacity?: number;
  operationalCapacity?: number;
  
  nominalConstructionMaterialId?: number;
  nominalExteriorCoatingId?: number;
  nominalInteriorCoatingId?: number;
  
  operationalStatusId: number;
  vendorId: number;
  pipelineSystemId?: number;
  departureFacilityId?: number;
  arrivalFacilityId?: number;
}

export interface PipelineUpdateDTO extends Partial<PipelineCreateDTO> {
  id: number;
}
