import { ForbiddenException } from '@nestjs/common';
import { getMessage } from './translator';
import { Locale } from 'src/types/Locale';

export const validateSameUserAccess = (
  requestingUserId: string,
  targetUserId: string,
  lang: Locale,
): void => {
  const isSameUser = requestingUserId === targetUserId;

  if (!isSameUser) {
    throw new ForbiddenException(getMessage('authorization_noAccess', lang));
  }
};
