/**
 * CompanyType Service - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.service.CompanyTypeService
 * 
 * Provides CRUD operations and search functionality for company types.
 * Company types categorize organizations (National Oil Company, Private, Joint Venture, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-08-2026 - Added getAllNoPagination method
 */

import axiosInstance from '@/shared/config/axios';
import type { CompanyTypeDTO } from '../dto/CompanyTypeDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/network/type/company';

export class CompanyTypeService {
  /**
   * Get all company types with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<CompanyTypeDTO>> {
    const response = await axiosInstance.get<Page<CompanyTypeDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all company types without pagination
   */
  static async getAllNoPagination(): Promise<CompanyTypeDTO[]> {
    const response = await axiosInstance.get<CompanyTypeDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get company type by ID
   */
  static async getById(id: number): Promise<CompanyTypeDTO> {
    const response = await axiosInstance.get<CompanyTypeDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new company type
   */
  static async create(dto: CompanyTypeDTO): Promise<CompanyTypeDTO> {
    const response = await axiosInstance.post<CompanyTypeDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing company type
   */
  static async update(id: number, dto: CompanyTypeDTO): Promise<CompanyTypeDTO> {
    const response = await axiosInstance.put<CompanyTypeDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete company type by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all company type fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<CompanyTypeDTO>> {
    const response = await axiosInstance.get<Page<CompanyTypeDTO>>(`${BASE_URL}/search`, {
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
