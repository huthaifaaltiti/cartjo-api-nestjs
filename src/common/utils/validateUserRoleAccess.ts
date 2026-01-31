import { ForbiddenException } from '@nestjs/common';
import { ALLOWED_AUTHENTICATED_ROLES } from '../constants/roles.constants';
import { getMessage } from './translator';
import { UserRole } from 'src/enums/user-role.enum';

type AccessLevel = 'user' | 'admin';

/**
 * Validates whether the requesting user has access based on access level.
 * - default: admin
 * - user: USER only
 */
export const validateUserRoleAccess = (
  requestingUser: any,
  lang: 'en' | 'ar',
  accessLevel: AccessLevel = 'admin',
): true => {
  const { role } = requestingUser;

  const roleMap: Record<AccessLevel, UserRole[]> = {
    user: [UserRole.USER],
    admin: ALLOWED_AUTHENTICATED_ROLES,
  };

  if (!roleMap[accessLevel].includes(role)) {
    throw new ForbiddenException(getMessage('authorization_noAccess', lang));
  }

  return true;
};
