import { UserRole } from '../../enums/user-role.enum';

export const ALLOWED_AUTHENTICATED_ROLES = [
  UserRole.OWNER,
  UserRole.ADMINISTRATOR,
];
