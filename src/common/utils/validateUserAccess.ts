import { ForbiddenException } from '@nestjs/common';
import { ALLOWED_AUTHENTICATED_ROLES } from '../constants/roles.constants';

export const validateUserAccess = (requestingUser: any): void => {
  if (!ALLOWED_AUTHENTICATED_ROLES.includes(requestingUser.role)) {
    throw new ForbiddenException();
  }
};
