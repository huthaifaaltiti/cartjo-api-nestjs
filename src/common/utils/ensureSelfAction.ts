import { ForbiddenException } from '@nestjs/common';
import { getMessage } from './translator';

export const ensureSelfAction = (
  userId: string,
  requestingUserId: string,
  lang: 'en' | 'ar',
): void => {
  if (!userId || userId !== requestingUserId) {
    throw new ForbiddenException(getMessage('authorization_noAccess', lang));
  }
};
