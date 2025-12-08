import { Permission } from 'src/enums/permission.enum';
import { UserRole } from 'src/enums/user-role.enum';

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_PRODUCTS,
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_ORDERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_DISCOUNTS,
  ],
  [UserRole.ADMINISTRATOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_PRODUCTS,
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_DISCOUNTS,
  ],
  [UserRole.USER]: [
    Permission.VIEW_PRODUCTS,
    Permission.PLACE_ORDER,
    Permission.VIEW_OWN_ORDERS,
    Permission.WRITE_REVIEWS,
  ],
};
