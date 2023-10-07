import { UserRole } from "@dfcomps/contracts";

export interface UserAccessInterface {
    userId: string | null;
    roles: UserRole[];
}