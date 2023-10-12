import { UserRole } from '@dfcomps/contracts';

export interface LoginResponseDto {
  user: {
    avatar: string | null;
    country: string | null;
    cpmRating: number;
    vq3Rating: number;
    id: number;
    nick: string;
    roles: UserRole[];
  };
  token: string;
}
