import { UserRole } from '@dfcomps/contracts';

export interface UserInterface {
  avatar: string;
  country: string;
  cpmRating: number;
  id: number;
  nick: string;
  vq3Rating: number;
  roles: UserRole[];
}
