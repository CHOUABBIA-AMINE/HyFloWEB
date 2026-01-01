/**
 * Mail Nature Service
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { MailNatureDTO } from '../dto/MailNatureDTO';

class MailNatureService {
  private readonly BASE_URL = '/common/communication/mailNature';

  async getAll(): Promise<MailNatureDTO[]> {
    const response = await axiosInstance.get<MailNatureDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getById(id: number): Promise<MailNatureDTO> {
    const response = await axiosInstance.get<MailNatureDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}

export default new MailNatureService();
