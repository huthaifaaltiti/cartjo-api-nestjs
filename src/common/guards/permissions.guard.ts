import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../../enums/permission.enum';
import { getMessage } from '../utils/translator';
import { Locale } from '../../enums/locale.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // If no permissions are specified, let the request pass
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Check if user exists and has the required permissions
    const hasPermission = requiredPermissions.every(permission =>
      user?.permissions?.includes(permission),
    );

    const forbiddenMessage = getMessage(
      'permission_insufficientPermissions',
      request?.body?.lang ?? Locale.EN,
    );

    if (!hasPermission) {
      throw new ForbiddenException(forbiddenMessage);
    }

    return true;
  }
}
