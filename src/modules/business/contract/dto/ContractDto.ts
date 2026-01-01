export interface ContractDto {
  id?: number;
  internalId?: string;
  contractYear?: string;
  reference?: string;
  designationAr?: string;
  designationEn?: string;
  designationFr?: string;
  contractAmount?: number;
  startDate?: string;
  endDate?: string;
  signatureDate?: string;
  approvalReference?: string;
  approvalDate?: string;
  observation?: string;
  consultationId?: number;
  providerId?: number;
  contractTypeId?: number;
  procurementStatusId?: number;
  approvalStatusId?: number;
  procurementDirectorId?: number;
  contractStepId?: number;
}
