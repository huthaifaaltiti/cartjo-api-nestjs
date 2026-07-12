import { ForbiddenException } from '@nestjs/common';
import { Permission } from '../../enums/permission.enum';
import { Locale } from '../../types/Locale';
import { getMessage } from './translator';
import { Locale as LocaleEnum } from '../../enums/locale.enum';

export function checkRequiredPermissions(
  userPermissions: Permission[],
  required: Permission[],
  lang: Locale,
) {
  const hasAccess = required.every(p => userPermissions?.includes(p));
  const forbiddenMessage = getMessage(
    'permission_insufficientPermissions',
    lang ?? LocaleEnum.EN,
  );

  if (!hasAccess) {
    throw new ForbiddenException(forbiddenMessage);
  }
}
