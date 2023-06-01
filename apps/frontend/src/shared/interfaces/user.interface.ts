import { UserAccess } from '../enums/user-access.enum';

export interface UserInterface {
  access: UserAccess;
  avatar: string;
  country: string;
  cpmRating: string;
  id: string;
  nick: string;
  teamId: string;
  teamStatus: string;
  vq3Rating: string;
}
