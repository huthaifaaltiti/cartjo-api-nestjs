import { ForbiddenException } from '@nestjs/common';

import { ALLOWED_AUTHENTICATED_ROLES } from '../constants/roles.constants';
import { getMessage } from './translator';

/**
 * Ensures that the logged-in and authenticated user is performing an action.
 * @param requestingUser - The user being acted upon.
 * @param lang - Language for error messages.
 */
export const validateUserRoleAccess = (
  requestingUser: any,
  lang: 'en' | 'ar',
): void => {
  const { role } = requestingUser;

  if (!ALLOWED_AUTHENTICATED_ROLES.includes(role)) {
    throw new ForbiddenException(getMessage('authorization_noAccess', lang));
  }
};
