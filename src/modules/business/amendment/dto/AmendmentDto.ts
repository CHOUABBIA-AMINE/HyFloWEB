export interface AmendmentDto {
  id?: number;
  internalId?: string;
  amendmentYear?: string;
  reference?: string;
  designationAr?: string;
  designationEn?: string;
  designationFr?: string;
  amendmentAmount?: number;
  signatureDate?: string;
  observation?: string;
  contractId?: number;
  amendmentTypeId?: number;
  procurementStatusId?: number;
  approvalStatusId?: number;
  amendmentStepId?: number;
}
