import { UserRole } from "@dfcomps/contracts";

export interface UserAccessInterface {
    userId: number | null;
    roles: UserRole[];
}