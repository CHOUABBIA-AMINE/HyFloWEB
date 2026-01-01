/**
 * Mail Type DTO
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

export interface MailTypeDTO {
  id?: number;
  code: string;
  designationFr: string;
  designationEn?: string;
  designationAr?: string;
  createdAt?: string;
  updatedAt?: string;
}
