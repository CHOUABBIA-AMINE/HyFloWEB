// Matches backend AuthenticationRequest exactly — field is 'username', not 'email'
export interface LoginRequestDTO {
  username: string;
  password: string;
}
