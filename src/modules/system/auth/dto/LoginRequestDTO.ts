// Matches backend AuthenticationRequest exactly — username (not email), password only
export interface LoginRequestDTO {
  username: string;
  password: string;
}
