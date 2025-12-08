import { UnauthorizedException } from '@nestjs/common';

import { getMessage } from './translator';
import { Locale } from 'src/types/Locale';

export const validateUserActiveStatus = (user: any, lang: Locale) => {
  if (!user || user.isDeleted || !user.isActive) {
    const message = user?.isDeleted
      ? 'authorization_accountDeleted'
      : user?.isActive === false
        ? 'authorization_accountInactive'
        : 'authorization_InvalidCredentials';

    throw new UnauthorizedException({
      statusCode: 401,
      isSuccess: false,
      message: getMessage(message, lang),
      token: null,
    });
  }
};
