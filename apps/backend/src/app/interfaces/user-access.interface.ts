import { UserRole } from "@dfcomps/contracts";

export interface UserAccessInterface {
    userId: number | null;
    commentsBanDate: string | null;
    roles: UserRole[];
}