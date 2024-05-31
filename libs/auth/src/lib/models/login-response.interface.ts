import { UserRoles } from './user-roles.enum';

export interface LoginResponseInterface {
  user: {
    avatar: string | null;
    country: string | null;
    cpmRating: number;
    vq3Rating: number;
    id: number;
    nick: string;
    roles: UserRoles[];
    discordTag: string | null;
    lastMapSuggestionTime: string | null;
  };
  token: string;
}
