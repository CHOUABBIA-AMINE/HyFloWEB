/**
 * Mail Service
 * Matches: dz.mdn.iaas.common.communication.service.MailService.java
 * Communicates with: MailController.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-29-2025 - Set id=null in create
 * @updated 12-29-2025 - Added referenced mails API methods
 * @updated 12-30-2025 - Changed endpoint to referencedMails (camelCase)
 */

import axiosInstance from '../../../../shared/config/axios';
import { MailDTO } from '../dto/MailDTO';

class MailService {
  private readonly BASE_URL = '/common/communication/mail';

  async getAll(): Promise<MailDTO[]> {
    const response = await axiosInstance.get<MailDTO[]>(this.BASE_URL);
    return response.data;
  }

  async getById(id: number): Promise<MailDTO> {
    const response = await axiosInstance.get<MailDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async getByReference(reference: string): Promise<MailDTO> {
    const response = await axiosInstance.get<MailDTO>(`${this.BASE_URL}/reference/${reference}`);
    return response.data;
  }

  async create(mail: MailDTO): Promise<MailDTO> {
    const response = await axiosInstance.post<MailDTO>(this.BASE_URL, { ...mail, id: null });
    return response.data;
  }

  async update(id: number, mail: MailDTO): Promise<MailDTO> {
    const response = await axiosInstance.put<MailDTO>(`${this.BASE_URL}/${id}`, mail);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }

  async getByMailNature(mailNatureId: number): Promise<MailDTO[]> {
    const response = await axiosInstance.get<MailDTO[]>(`${this.BASE_URL}/mailNature/${mailNatureId}`);
    return response.data;
  }

  async getByMailType(mailTypeId: number): Promise<MailDTO[]> {
    const response = await axiosInstance.get<MailDTO[]>(`${this.BASE_URL}/mailType/${mailTypeId}`);
    return response.data;
  }

  // Referenced Mails Methods
  
  /**
   * Get all mails referenced by a specific mail
   * @param mailId - The ID of the parent mail
   * @returns Array of referenced mail DTOs
   */
  async getReferencedMails(mailId: number): Promise<MailDTO[]> {
    const response = await axiosInstance.get<MailDTO[]>(`${this.BASE_URL}/${mailId}/referencedMails`);
    return response.data;
  }

  /**
   * Add a single mail reference
   * @param mailId - The ID of the parent mail
   * @param referencedMailId - The ID of the mail to reference
   */
  async addReferencedMail(mailId: number, referencedMailId: number): Promise<void> {
    await axiosInstance.post(`${this.BASE_URL}/${mailId}/referencedMails/${referencedMailId}`);
  }

  /**
   * Add multiple mail references at once
   * @param mailId - The ID of the parent mail
   * @param referencedMailIds - Array of mail IDs to reference
   */
  async addReferencedMails(mailId: number, referencedMailIds: number[]): Promise<void> {
    await axiosInstance.post(`${this.BASE_URL}/${mailId}/referencedMails`, referencedMailIds);
  }

  /**
   * Remove a mail reference
   * @param mailId - The ID of the parent mail
   * @param referencedMailId - The ID of the referenced mail to remove
   */
  async removeReferencedMail(mailId: number, referencedMailId: number): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${mailId}/referencedMails/${referencedMailId}`);
  }

  /**
   * Update all referenced mails (replaces existing references)
   * @param mailId - The ID of the parent mail
   * @param referencedMailIds - Array of mail IDs to set as references
   */
  async updateReferencedMails(mailId: number, referencedMailIds: number[]): Promise<void> {
    await axiosInstance.put(`${this.BASE_URL}/${mailId}/referencedMails`, referencedMailIds);
  }
}

export default new MailService();
