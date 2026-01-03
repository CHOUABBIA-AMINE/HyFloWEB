/**
 * Structure Service
 * Matches: dz.mdn.iaas.common.administration.service.StructureService.java
 * Communicates with: StructureController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 * @updated 12-30-2025 - Added getAllList method
 * @updated 01-03-2026 - Added pageable methods for list and search
 */

import axiosInstance from '../../../../shared/config/axios';
import { StructureDTO } from '../dto/StructureDTO';

interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface PageableParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  structureTypeId?: number;
}

class StructureService {
  private readonly BASE_URL = '/general/organization/structure';

  /**
   * Get pageable structures
   * @param params - Pagination and filter parameters
   * @returns Promise with pageable response
   */
  async getPageable(params: PageableParams = {}): Promise<PageableResponse<StructureDTO>> {
    const { page = 0, size = 25, sort, search, structureTypeId } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    if (sort) queryParams.append('sort', sort);
    if (search) queryParams.append('search', search);
    if (structureTypeId) queryParams.append('structureTypeId', structureTypeId.toString());

    const response = await axiosInstance.get<PageableResponse<StructureDTO>>(
      `${this.BASE_URL}?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Search structures with pagination
   * @param searchTerm - Search term
   * @param params - Additional parameters
   * @returns Promise with pageable response
   */
  async search(searchTerm: string, params: PageableParams = {}): Promise<PageableResponse<StructureDTO>> {
    return this.getPageable({ ...params, search: searchTerm });
  }

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
export type { PageableResponse, PageableParams };
