/**
 * Location Service - General Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.service.LocationService
 * 
 * Provides CRUD operations and search functionality for locations/addresses.
 * Locations belong to localities in the geographic hierarchy.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { LocationDTO } from '../dto/LocationDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/localization/location';

export class LocationService {
  /**
   * Get all locations with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<LocationDTO>> {
    const response = await axiosInstance.get<Page<LocationDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all locations without pagination
   */
  static async getAllNoPagination(): Promise<LocationDTO[]> {
    const response = await axiosInstance.get<LocationDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get location by ID
   */
  static async getById(id: number): Promise<LocationDTO> {
    const response = await axiosInstance.get<LocationDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new location
   * Backend logs: "Creating location: code={placeName}"
   */
  static async create(dto: LocationDTO): Promise<LocationDTO> {
    const response = await axiosInstance.post<LocationDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing location
   * Backend logs: "Updating location with ID: {id}"
   */
  static async update(id: number, dto: LocationDTO): Promise<LocationDTO> {
    const response = await axiosInstance.put<LocationDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete location by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all location fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<LocationDTO>> {
    const response = await axiosInstance.get<Page<LocationDTO>>(`${BASE_URL}/search`, {
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
   * Find locations by locality ID
   */
  static async findByLocality(localityId: number): Promise<LocationDTO[]> {
    const response = await axiosInstance.get<LocationDTO[]>(`${BASE_URL}/by-locality/${localityId}`);
    return response.data;
  }
}
