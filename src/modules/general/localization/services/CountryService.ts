/**
 * Country Service - General Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.service.CountryService
 * 
 * Provides CRUD operations and search functionality for countries.
 * Countries represent the highest level in the geographic hierarchy.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { CountryDTO } from '../dto/CountryDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/localization/country';

export class CountryService {
  /**
   * Get all countries with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<CountryDTO>> {
    const response = await axiosInstance.get<Page<CountryDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all countries without pagination
   */
  static async getAllNoPagination(): Promise<CountryDTO[]> {
    const response = await axiosInstance.get<CountryDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get country by ID
   */
  static async getById(id: number): Promise<CountryDTO> {
    const response = await axiosInstance.get<CountryDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new country
   * Backend logs: "Creating country: code={code}, designationFr={designationFr}"
   */
  static async create(dto: CountryDTO): Promise<CountryDTO> {
    const response = await axiosInstance.post<CountryDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing country
   * Backend logs: "Updating country with ID: {id}"
   */
  static async update(id: number, dto: CountryDTO): Promise<CountryDTO> {
    const response = await axiosInstance.put<CountryDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete country by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all country fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<CountryDTO>> {
    const response = await axiosInstance.get<Page<CountryDTO>>(`${BASE_URL}/search`, {
      params: {
        q: searchTerm,
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }
}
