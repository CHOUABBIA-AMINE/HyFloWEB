import { UserPrincipalDTO } from './UserPrincipalDTO';

// Matches backend JwtAuthenticationResponse: accessToken + tokenType + embedded UserPrincipal
export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string;
  user: UserPrincipalDTO;
}
