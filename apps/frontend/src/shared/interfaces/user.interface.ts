import { UserRole } from '@dfcomps/contracts';

export interface UserInterface {
  avatar: string;
  country: string;
  cpmRating: number;
  id: string;
  nick: string;
  vq3Rating: number;
  roles: UserRole[];
}
