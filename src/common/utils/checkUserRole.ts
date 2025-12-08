import { UserRole } from 'src/enums/user-role.enum';

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
