/**
 * StructureType Service
 * Matches: dz.mdn.iaas.common.administration.service.StructureTypeService.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { StructureTypeDTO } from '../dto/StructureTypeDTO';

class StructureTypeService {
  private readonly BASE_URL = '/common/administration/structureType';

  async getAll(): Promise<StructureTypeDTO[]> {
    const response = await axiosInstance.get<StructureTypeDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getById(id: number): Promise<StructureTypeDTO> {
    const response = await axiosInstance.get<StructureTypeDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}

export default new StructureTypeService();
