import { UserRole } from "../../enums/user-role.enum";

interface CheckRoleOptions {
  userRole: UserRole;
  requiredRole: UserRole;
}

export const checkUserRole = ({
  userRole,
  requiredRole,
}: CheckRoleOptions): boolean => {
  return userRole === requiredRole;
};
