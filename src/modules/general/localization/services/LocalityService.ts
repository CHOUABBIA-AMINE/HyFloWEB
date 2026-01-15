/**
 * Locality Service - General Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.service.LocalityService
 * 
 * Provides CRUD operations and search functionality for localities/cities.
 * Localities belong to both State and District in the geographic hierarchy.
 * 
 * Updated: 01-15-2026 - Added findByDistrict method
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-15-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { LocalityDTO } from '../dto/LocalityDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/localization/locality';

export class LocalityService {
  /**
   * Get all localities with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<LocalityDTO>> {
    const response = await axiosInstance.get<Page<LocalityDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all localities without pagination
   */
  static async getAllNoPagination(): Promise<LocalityDTO[]> {
    const response = await axiosInstance.get<LocalityDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get locality by ID
   */
  static async getById(id: number): Promise<LocalityDTO> {
    const response = await axiosInstance.get<LocalityDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new locality
   * Backend logs: "Creating locality: code={code}, designationFr={designationFr}, stateId={stateId}, districtId={districtId}"
   */
  static async create(dto: LocalityDTO): Promise<LocalityDTO> {
    const response = await axiosInstance.post<LocalityDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing locality
   * Backend logs: "Updating locality with ID: {id}"
   */
  static async update(id: number, dto: LocalityDTO): Promise<LocalityDTO> {
    const response = await axiosInstance.put<LocalityDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete locality by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all locality fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<LocalityDTO>> {
    const response = await axiosInstance.get<Page<LocalityDTO>>(`${BASE_URL}/search`, {
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
   * Find localities by state ID
   */
  static async findByState(stateId: number): Promise<LocalityDTO[]> {
    const response = await axiosInstance.get<LocalityDTO[]>(`${BASE_URL}/by-state/${stateId}`);
    return response.data;
  }

  /**
   * Find localities by district ID
   */
  static async findByDistrict(districtId: number): Promise<LocalityDTO[]> {
    const response = await axiosInstance.get<LocalityDTO[]>(`${BASE_URL}/by-district/${districtId}`);
    return response.data;
  }
}
