import { UserRole } from './user-roles.enum';

export interface LoginResponseDto {
  user: {
    avatar: string;
    country: string;
    cpmRating: number;
    vq3Rating: number;
    id: string;
    nick: string;
    roles: UserRole[];
  };
  token: string;
}
