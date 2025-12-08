import { ForbiddenException } from '@nestjs/common';
import { getMessage } from './translator';
import { Locale } from 'src/types/Locale';

export const validateSameUsersRoleLevel = (
  userRole: string,
  requestingUserRole: string,
  lang: Locale,
): void => {
  if (userRole === requestingUserRole) {
    throw new ForbiddenException(getMessage('authorization_noAccess', lang));
  }
};
