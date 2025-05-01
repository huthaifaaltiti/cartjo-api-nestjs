import { ForbiddenException } from '@nestjs/common';

import { getMessage } from './translator';
import { ALLOWED_AUTHENTICATED_ROLES } from '../constants/roles.constants';

/**
 * Ensures that the logged-in user is performing an action on their own account.
 * @param userId - The ID of the user being acted upon.
 * @param requestingUserId - The ID of the currently logged-in user.
 * @param lang - Language for error messages.
 */
export const ensureSelfAction = (
  userId: string,
  requestingUserId: string,
  lang: 'en' | 'ar',
): void => {
  if (!userId || userId !== requestingUserId) {
    throw new ForbiddenException(getMessage('authorization_noAccess', lang));
  }
};

/**
 * Ensures that the logged-in and authenticated user is performing an action.
 * @param requestingUser - The user being acted upon.
 * @param lang - Language for error messages.
 */
export const validateUserRoleAccess = (
  requestingUser: any,
  lang: 'en' | 'ar',
): void => {
  if (!ALLOWED_AUTHENTICATED_ROLES.includes(requestingUser.role)) {
    throw new ForbiddenException(getMessage('authorization_noAccess', lang));
  }
};
