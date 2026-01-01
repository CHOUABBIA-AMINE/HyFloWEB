export interface SubmissionDto {
  id?: number;
  submissionDate?: string;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  rank?: number;
  isAwarded?: boolean;
  observation?: string;
  consultationId?: number;
  providerId?: number;
}
