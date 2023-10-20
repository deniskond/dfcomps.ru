import { UserRoles } from '@dfcomps/auth';

export interface UserInterface {
  avatar: string | null;
  country: string | null;
  cpmRating: number;
  id: number;
  nick: string;
  vq3Rating: number;
  roles: UserRoles[];
}
