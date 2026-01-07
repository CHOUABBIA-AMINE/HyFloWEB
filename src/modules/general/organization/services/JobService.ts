/**
 * Job Service - General Organization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.organization.service.JobService
 * 
 * Provides CRUD operations and search functionality for jobs/positions.
 * Jobs represent positions within organizational structures.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 06-26-2025
 * @updated 01-02-2026
 */

import { apiClient } from '@/lib/api-client';
import type { JobDTO } from '../dto/JobDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/api/general/organization/jobs';

export class JobService {
  /**
   * Get all jobs with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<JobDTO>> {
    const response = await apiClient.get<Page<JobDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get all jobs without pagination
   */
  static async getAllNoPagination(): Promise<JobDTO[]> {
    const response = await apiClient.get<JobDTO[]>(`${BASE_URL}/all`);
    return response.data;
  }

  /**
   * Get job by ID
   */
  static async getById(id: number): Promise<JobDTO> {
    const response = await apiClient.get<JobDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create new job
   * Backend logs: "Creating job: code={code}, designationFr={designationFr}"
   */
  static async create(dto: JobDTO): Promise<JobDTO> {
    const response = await apiClient.post<JobDTO>(BASE_URL, dto);
    return response.data;
  }

  /**
   * Update existing job
   * Backend logs: "Updating job with ID: {id}"
   */
  static async update(id: number, dto: JobDTO): Promise<JobDTO> {
    const response = await apiClient.put<JobDTO>(`${BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete job by ID
   */
  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Global search across all job fields
   */
  static async globalSearch(
    searchTerm: string,
    pageable: Pageable
  ): Promise<Page<JobDTO>> {
    const response = await apiClient.get<Page<JobDTO>>(`${BASE_URL}/search`, {
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
   * Get jobs by structure ID
   */
  static async getByStructureId(structureId: number): Promise<JobDTO[]> {
    const response = await apiClient.get<JobDTO[]>(`${BASE_URL}/by-structure/${structureId}`);
    return response.data;
  }
}
