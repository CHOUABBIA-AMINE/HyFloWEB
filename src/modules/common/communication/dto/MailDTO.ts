/**
 * Mail DTO
 * Matches: dz.mdn.iaas.common.communication.model.Mail.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 */

import { MailNatureDTO } from './MailNatureDTO';
import { MailTypeDTO } from './MailTypeDTO';

export interface MailDTO {
  id?: number;
  reference: string;
  recordNumber?: string;
  subject: string;
  mailDate: string;
  recordDate?: string;
  mailNatureId?: number;
  mailNature?: MailNatureDTO;
  mailTypeId?: number;
  mailType?: MailTypeDTO;
  structureId?: number;
  fileId?: number;
  createdAt?: string;
  updatedAt?: string;
}
