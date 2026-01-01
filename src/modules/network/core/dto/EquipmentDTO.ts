/**
 * Equipment DTO
 * Mirrors backend: dz.mdn.iaas.network.core.dto.EquipmentDTO
 */

import { OperationalStatusDTO } from '../../common/dto';
import { EquipmentTypeDTO } from '../../type/dto/EquipmentTypeDTO';
import { FacilityDTO } from './FacilityDTO';

export interface EquipmentDTO {
  id: number;

  name: string;
  code: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;

  manufacturingDate: string;
  installationDate: string;
  lastMaintenanceDate: string;

  operationalStatusId: number;
  equipmentTypeId: number;
  facilityId: number;

  operationalStatus?: OperationalStatusDTO | null;
  equipmentType?: EquipmentTypeDTO | null;
  facility?: FacilityDTO | null;
}
