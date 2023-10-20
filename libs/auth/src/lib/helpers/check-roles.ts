import { UserRoles } from '../models/user-roles.enum';

/**
 * Checks if user has one of the roles from input array;
 * if the user is ADMIN or SUPERADMIN, always returns true
 * @param rolesToCheck
 */
export function checkUserRoles(userRoles: UserRoles[], rolesToCheck: UserRoles[]): boolean {
  const targetRolesToCheck: UserRoles[] = [...rolesToCheck, UserRoles.ADMIN, UserRoles.SUPERADMIN];

  return userRoles.some((userRole: UserRoles) => targetRolesToCheck.some((role: UserRoles) => role === userRole));
}

export function checkIfSuperadmin(userRoles: UserRoles[]): boolean {
  return userRoles.some((userRole: UserRoles) => userRole === UserRoles.SUPERADMIN);
}
