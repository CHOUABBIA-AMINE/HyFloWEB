/**
 * HydrocarbonField DTO
 * Data Transfer Object for HydrocarbonField entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-23-2025
 */

import { VendorDTO } from '../../common/dto';
import { OperationalStatusDTO } from '../../common/dto';
import { HydrocarbonFieldTypeDTO } from '../../type/dto';
import { LocalityDTO } from '../../../common/administration/dto';

export interface HydrocarbonFieldDTO {
  id: number;
  code: string;
  name: string;
  placeName: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // IDs for relations
  operationalStatusId: number;
  vendorId: number;
  localityId: number;
  hydrocarbonFieldTypeId: number;
  
  // Nested objects (from backend)
  operationalStatus?: OperationalStatusDTO;
  vendor?: VendorDTO;
  locality?: LocalityDTO;
  hydrocarbonFieldType?: HydrocarbonFieldTypeDTO;
  
  // Legacy string fields (fallback)
  operationalStatusName?: string;
  vendorName?: string;
  localityName?: string;
  hydrocarbonFieldTypeName?: string;
  
  pipelineIds?: number[];
  partnerIds?: number[];
  productIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HydrocarbonFieldCreateDTO {
  code: string;
  name: string;
  placeName: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  operationalStatusId: number;
  vendorId: number;
  localityId: number;
  hydrocarbonFieldTypeId: number;
}
