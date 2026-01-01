export interface ResetPasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
