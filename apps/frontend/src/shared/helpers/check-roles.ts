import { UserRole } from '@dfcomps/contracts';
import { UserInterface } from '~shared/interfaces/user.interface';

/**
 * Checks if user has one of the roles from input array
 * @param roles
 */
export function checkUserRoles(user: UserInterface, roles: UserRole[]): boolean {
  return user.roles.some((userRole: UserRole) => roles.some((role: UserRole) => role === userRole));
}
