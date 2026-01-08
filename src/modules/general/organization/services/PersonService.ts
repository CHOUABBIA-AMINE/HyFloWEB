/**
 * Person Service - General Organization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.organization.service.PersonService
 * 
 * Provides CRUD operations and search functionality for persons.
 * Persons represent individuals (potential employees or contacts).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import axiosInstance from '@/shared/config/axios';
import type { PersonDTO } from '../dto/PersonDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/general/organization/persons';

export class PersonService {
  /**
   * Get all persons with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<PersonDTO>> {
    const response = await axiosInstance.get<Page<PersonDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all persons without pagination
   */
  static async getAllNoPagination(): Promise<PersonDTO[]> {
    const response = await axiosInstance.get<PersonDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get person by ID
   */
  static async getById(id: number): Promise<PersonDTO> {
    const response = await axiosInstance.get<PersonDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new person
   * Backend logs: "Creating person: lastNameLt={lastNameLt}, firstNameLt={firstNameLt}"
   */
  static async create(dto: PersonDTO): Promise<PersonDTO> {
    const response = await axiosInstance.post<PersonDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing person
   * Backend logs: "Updating person with ID: {id}"
   */
  static async update(id: number, dto: PersonDTO): Promise<PersonDTO> {
    const response = await axiosInstance.put<PersonDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete person by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all person fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<PersonDTO>> {
    const response = await axiosInstance.get<Page<PersonDTO>>(`${BASE_URL}/search`, {
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
