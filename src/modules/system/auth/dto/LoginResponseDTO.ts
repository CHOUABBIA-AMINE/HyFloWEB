import { UserPrincipalDTO } from './UserPrincipalDTO';

// Matches backend JwtAuthenticationResponse
export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string;
  user: UserPrincipalDTO;
}
