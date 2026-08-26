import { RolePermissions } from '../../common/constants/roles-permissions.constant';
import { UserRole } from '../../enums/user-role.enum';

export const ROLES_PERMISSIONS_SEEDS = [
  {
    role: UserRole.OWNER,
    permissions: RolePermissions[UserRole.OWNER],
  },
  {
    role: UserRole.ADMINISTRATOR,
    permissions: RolePermissions[UserRole.ADMINISTRATOR],
  },
  {
    role: UserRole.USER,
    permissions: RolePermissions[UserRole.USER],
  },
  {
    role: UserRole.CREATOR,
    permissions: RolePermissions[UserRole.CREATOR],
  },
];
