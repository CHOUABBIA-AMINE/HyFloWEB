import { GrantedAuthorityDTO } from './GrantedAuthorityDTO';

export interface UserPrincipalDTO {
  id: number;
  username: string;
  email: string;
  fullName: string;
  enabled: boolean;
  authorities: GrantedAuthorityDTO[];
}
