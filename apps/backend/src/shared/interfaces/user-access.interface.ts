import { UserRoles } from '@dfcomps/auth';

export interface UserAccessInterface {
  userId: number | null;
  commentsBanDate: string | null;
  roles: UserRoles[];
}
