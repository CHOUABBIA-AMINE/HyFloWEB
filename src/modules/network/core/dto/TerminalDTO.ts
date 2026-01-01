/**
 * Terminal DTO
 * Data Transfer Object for Terminal entity
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-23-2025
 */

import { VendorDTO } from '../../common/dto';
import { OperationalStatusDTO } from '../../common/dto';
import { TerminalTypeDTO } from '../../type/dto';
import { LocalityDTO } from '../../../common/administration/dto';

export interface TerminalDTO {
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
  terminalTypeId: number;
  
  // Nested objects (from backend)
  operationalStatus?: OperationalStatusDTO;
  vendor?: VendorDTO;
  locality?: LocalityDTO;
  terminalType?: TerminalTypeDTO;
  
  // Legacy string fields (fallback)
  operationalStatusName?: string;
  vendorName?: string;
  localityName?: string;
  terminalTypeName?: string;
  
  pipelineIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TerminalCreateDTO {
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
  terminalTypeId: number;
}
