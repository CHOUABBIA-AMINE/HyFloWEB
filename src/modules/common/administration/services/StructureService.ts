/**
 * Structure Service
 * Matches: dz.mdn.iaas.common.administration.service.StructureService.java
 * Communicates with: StructureController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 * @updated 12-30-2025 - Added getAllList method
 */

import axiosInstance from '../../../../shared/config/axios';
import { StructureDTO } from '../dto/StructureDTO';

class StructureService {
  private readonly BASE_URL = '/common/administration/structure';

  async getAll(): Promise<StructureDTO[]> {
    const response = await axiosInstance.get<StructureDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getAllList(): Promise<StructureDTO[]> {
    return this.getAll();
  }

  async getById(id: number): Promise<StructureDTO> {
    const response = await axiosInstance.get<StructureDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<StructureDTO> {
    const response = await axiosInstance.get<StructureDTO>(`${this.BASE_URL}/code/${code}`);
    return response.data;
  }

  async create(structure: StructureDTO): Promise<StructureDTO> {
    const response = await axiosInstance.post<StructureDTO>(this.BASE_URL, { ...structure, id: null });
    return response.data;
  }

  async update(id: number, structure: StructureDTO): Promise<StructureDTO> {
    const response = await axiosInstance.put<StructureDTO>(`${this.BASE_URL}/${id}`, structure);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }

  async getByParentStructure(parentStructureId: number): Promise<StructureDTO[]> {
    const response = await axiosInstance.get<StructureDTO[]>(`${this.BASE_URL}/parent/${parentStructureId}`);
    return response.data;
  }

  async getByStructureType(structureTypeId: number): Promise<StructureDTO[]> {
    const response = await axiosInstance.get<StructureDTO[]>(`${this.BASE_URL}/type/${structureTypeId}`);
    return response.data;
  }

  async getRootStructures(): Promise<StructureDTO[]> {
    const response = await axiosInstance.get<StructureDTO[]>(`${this.BASE_URL}/roots`);
    return response.data;
  }
}

export default new StructureService();
