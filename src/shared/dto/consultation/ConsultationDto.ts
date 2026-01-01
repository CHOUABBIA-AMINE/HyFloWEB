export interface ConsultationDto {
  id?: number;
  internalId?: string;
  consultationYear?: string;
  reference?: string;
  designationAr?: string;
  designationEn?: string;
  designationFr?: string;
  allocatedAmount?: number;
  financialEstimation?: number;
  startDate?: string;
  approvalReference?: string;
  approvalDate?: string;
  publishDate?: string;
  deadline?: string;
  observation?: string;
  awardMethodId?: number;
  procurementNatureId?: number;
  budgetTypeId?: number;
  procurementStatusId?: number;
  approvalStatusId?: number;
  procurementDirectorId?: number;
  consultationStepId?: number;
}
