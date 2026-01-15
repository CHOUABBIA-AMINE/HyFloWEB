/**
 * District Service - General Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.service.DistrictService
 * 
 * Provides CRUD operations and search functionality for districts.
 * Districts belong to localities in the geographic hierarchy.
 * 
 * Geographic Hierarchy:
 * State → Locality → District → Location
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-15-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { DistrictDTO } from '../dto/DistrictDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/localization/district';

export class DistrictService {
  /**
   * Get all districts with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<DistrictDTO>> {
    const response = await axiosInstance.get<Page<DistrictDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all districts without pagination
   */
  static async getAllNoPagination(): Promise<DistrictDTO[]> {
    const response = await axiosInstance.get<DistrictDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get district by ID
   */
  static async getById(id: number): Promise<DistrictDTO> {
    const response = await axiosInstance.get<DistrictDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new district
   * Backend logs: "Creating district: code={code}, designationFr={designationFr}"
   */
  static async create(dto: DistrictDTO): Promise<DistrictDTO> {
    const response = await axiosInstance.post<DistrictDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing district
   * Backend logs: "Updating district with ID: {id}"
   */
  static async update(id: number, dto: DistrictDTO): Promise<DistrictDTO> {
    const response = await axiosInstance.put<DistrictDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete district by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all district fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<DistrictDTO>> {
    const response = await axiosInstance.get<Page<DistrictDTO>>(`${BASE_URL}/search`, {
      params: {
        q: searchTerm,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Find districts by locality ID
   */
  static async findByLocality(localityId: number): Promise<DistrictDTO[]> {
    const response = await axiosInstance.get<DistrictDTO[]>(`${BASE_URL}/by-locality/${localityId}`);
    return response.data;
  }
}
