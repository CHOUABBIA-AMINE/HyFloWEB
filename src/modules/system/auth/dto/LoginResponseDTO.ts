import { UserPrincipalDTO } from './UserPrincipalDTO';

export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string;
  user: UserPrincipalDTO;
}
