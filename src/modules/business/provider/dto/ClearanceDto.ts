export interface ClearanceDto {
  id?: number;
  clearanceNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  isValid?: boolean;
  providerId?: number;
}
