/**
 * Station DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.StationDTO
 * Updated: 01-07-2026 - Synced with backend U-006 update
 * 
 * Backend Updates History:
 * - U-006 (Jan 7, 2026, 10:59 AM): Added locationId field
 *   • Station now has location reference
 *   • Following U-005 architectural change
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocationDTO } from '../../../general/localization/dto/LocationDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { StationTypeDTO } from '../../type/dto/StationTypeDTO';
import { PipelineSystemDTO } from './PipelineSystemDTO';

export interface StationDTO {
  // Identifier
  id?: number;

  // Core infrastructure fields
  code: string; // @NotBlank, 2-20 chars (required)
  name: string; // @NotBlank, 3-100 chars (required)
  
  // Date fields
  installationDate?: string; // LocalDate (ISO format)
  commissioningDate?: string; // LocalDate (ISO format)
  decommissioningDate?: string; // LocalDate (ISO format)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  vendorId: number; // @NotNull (required)
  locationId: number; // @NotNull (required) - ADDED in U-006
  stationTypeId: number; // @NotNull (required)
  pipelineSystemId: number; // @NotNull (required)
  
  // Collections
  pipelineIds?: number[]; // Array of pipeline IDs
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  vendor?: VendorDTO;
  location?: LocationDTO; // ADDED in U-006
  stationType?: StationTypeDTO;
  pipelineSystem?: PipelineSystemDTO;
}

export const validateStationDTO = (data: Partial<StationDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length < 2 || data.code.length > 20) {
    errors.push("Code must be between 2 and 20 characters");
  }
  
  if (!data.name) {
    errors.push("Name is required");
  } else if (data.name.length < 3 || data.name.length > 100) {
    errors.push("Name must be between 3 and 100 characters");
  }
  
  if (data.operationalStatusId === undefined || data.operationalStatusId === null) {
    errors.push("Operational status is required");
  }
  
  if (data.structureId === undefined || data.structureId === null) {
    errors.push("Structure is required");
  }
  
  if (data.vendorId === undefined || data.vendorId === null) {
    errors.push("Vendor is required");
  }
  
  if (data.locationId === undefined || data.locationId === null) {
    errors.push("Location is required");
  }
  
  if (data.stationTypeId === undefined || data.stationTypeId === null) {
    errors.push("Station type is required");
  }
  
  if (data.pipelineSystemId === undefined || data.pipelineSystemId === null) {
    errors.push("Pipeline system is required");
  }
  
  return errors;
};
