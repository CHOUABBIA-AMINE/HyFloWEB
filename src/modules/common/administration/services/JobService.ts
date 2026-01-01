/**
 * Job Service
 * Matches: dz.mdn.iaas.common.administration.service.JobService.java
 * Communicates with: JobController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 * @updated 12-30-2025 - Added getAllList method
 */

import axiosInstance from '../../../../shared/config/axios';
import { JobDTO } from '../dto/JobDTO';

class JobService {
  private readonly BASE_URL = '/common/administration/job';

  async getAll(): Promise<JobDTO[]> {
    const response = await axiosInstance.get<JobDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getAllList(): Promise<JobDTO[]> {
    return this.getAll();
  }

  async getById(id: number): Promise<JobDTO> {
    const response = await axiosInstance.get<JobDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<JobDTO> {
    const response = await axiosInstance.get<JobDTO>(`${this.BASE_URL}/code/${code}`);
    return response.data;
  }

  async getByStructure(structureId: number): Promise<JobDTO[]> {
    const response = await axiosInstance.get<JobDTO[]>(`${this.BASE_URL}/structure/${structureId}`);
    return response.data;
  }

  async create(job: JobDTO): Promise<JobDTO> {
    const response = await axiosInstance.post<JobDTO>(this.BASE_URL, { ...job, id: null });
    return response.data;
  }

  async update(id: number, job: JobDTO): Promise<JobDTO> {
    const response = await axiosInstance.put<JobDTO>(`${this.BASE_URL}/${id}`, job);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new JobService();
