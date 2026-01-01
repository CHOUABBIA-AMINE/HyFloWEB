/**
 * Mail Type Service
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { MailTypeDTO } from '../dto/MailTypeDTO';

class MailTypeService {
  private readonly BASE_URL = '/common/communication/mailType';

  async getAll(): Promise<MailTypeDTO[]> {
    const response = await axiosInstance.get<MailTypeDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getById(id: number): Promise<MailTypeDTO> {
    const response = await axiosInstance.get<MailTypeDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}

export default new MailTypeService();
