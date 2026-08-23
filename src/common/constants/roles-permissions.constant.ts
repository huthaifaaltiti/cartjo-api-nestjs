import { Permission } from '../../enums/permission.enum';
import { UserRole } from '../../enums/user-role.enum';

const ADMIN_PERMISSIONS: Permission[] = [
  Permission.DASHBOARD_ACCESS,

  // Users
  Permission.USERS_READ,
  Permission.USERS_CREATE,
  Permission.USERS_UPDATE,
  Permission.USERS_DELETE,
  Permission.USERS_RESTORE,
  Permission.USERS_ACTIVATE,
  Permission.USERS_DEACTIVATE,

  // Categories
  Permission.CATEGORIES_READ,
  Permission.CATEGORIES_CREATE,
  Permission.CATEGORIES_UPDATE,
  Permission.CATEGORIES_DELETE,
  Permission.CATEGORIES_RESTORE,
  Permission.CATEGORIES_ACTIVATE,
  Permission.CATEGORIES_DEACTIVATE,

  // Sub Categories
  Permission.SUB_CATEGORIES_READ,
  Permission.SUB_CATEGORIES_CREATE,
  Permission.SUB_CATEGORIES_UPDATE,
  Permission.SUB_CATEGORIES_DELETE,
  Permission.SUB_CATEGORIES_RESTORE,
  Permission.SUB_CATEGORIES_ACTIVATE,
  Permission.SUB_CATEGORIES_DEACTIVATE,

  // Products
  Permission.PRODUCTS_READ,
  Permission.PRODUCTS_CREATE,
  Permission.PRODUCTS_UPDATE,
  Permission.PRODUCTS_DELETE,
  Permission.PRODUCTS_RESTORE,
  Permission.PRODUCTS_ACTIVATE,
  Permission.PRODUCTS_DEACTIVATE,

  // Logos
  Permission.LOGOS_READ,
  Permission.LOGOS_CREATE,
  Permission.LOGOS_UPDATE,
  Permission.LOGOS_DELETE,
  Permission.LOGOS_RESTORE,
  Permission.LOGOS_ACTIVATE,
  Permission.LOGOS_DEACTIVATE,

  // Banners
  Permission.BANNERS_READ,
  Permission.BANNERS_CREATE,
  Permission.BANNERS_UPDATE,
  Permission.BANNERS_DELETE,
  Permission.BANNERS_RESTORE,
  Permission.BANNERS_ACTIVATE,
  Permission.BANNERS_DEACTIVATE,

  // Type Hints
  Permission.TYPE_HINT_CONFIGS_READ,
  Permission.TYPE_HINT_CONFIGS_CREATE,
  Permission.TYPE_HINT_CONFIGS_UPDATE,
  Permission.TYPE_HINT_CONFIGS_DELETE,
  Permission.TYPE_HINT_CONFIGS_RESTORE,
  Permission.TYPE_HINT_CONFIGS_ACTIVATE,
  Permission.TYPE_HINT_CONFIGS_DEACTIVATE,

  // Showcases
  Permission.SHOWCASES_READ,
  Permission.SHOWCASES_CREATE,
  Permission.SHOWCASES_UPDATE,
  Permission.SHOWCASES_DELETE,
  Permission.SHOWCASES_RESTORE,
  Permission.SHOWCASES_ACTIVATE,
  Permission.SHOWCASES_DEACTIVATE,

  // Orders
  Permission.ORDERS_READ,
  Permission.ORDERS_UPDATE,
  Permission.ORDERS_CANCEL,
  Permission.ORDERS_REFUND,
  Permission.ORDERS_DELETE,
  Permission.ORDERS_RESTORE,
  Permission.ORDERS_CHANGE_DELIVERY_STATUS,
  Permission.ORDERS_CHANGE_PAYMENT_STATUS,

  // Reviews
  Permission.REVIEWS_READ,
  Permission.REVIEWS_UPDATE,
  Permission.REVIEWS_DELETE,

  // Profile
  Permission.PROFILE_READ,
  Permission.PROFILE_UPDATE,

  // Creators Videos
  Permission.CREATORS_VIDEOS_READ,
  Permission.CREATORS_VIDEOS_CREATE,
  Permission.CREATORS_VIDEOS_UPDATE,
  Permission.CREATORS_VIDEOS_DELETE,
  Permission.CREATORS_VIDEOS_RESTORE,
  Permission.CREATORS_VIDEOS_ACTIVATE,
  Permission.CREATORS_VIDEOS_DEACTIVATE,
];

const USER_PERMISSIONS: Permission[] = [
  // Orders
  Permission.ORDERS_CREATE_OWN,
  Permission.ORDERS_READ_OWN,

  // Reviews
  Permission.REVIEWS_CREATE,
  Permission.REVIEWS_READ_OWN,
  Permission.REVIEWS_UPDATE_OWN,
  Permission.REVIEWS_DELETE_OWN,

  // Profile
  Permission.PROFILE_READ,
  Permission.PROFILE_UPDATE,

  // Wishlist
  Permission.WISHLIST_READ,
  Permission.WISHLIST_UPDATE,

  // Cart
  Permission.CART_READ,
  Permission.CART_UPDATE,
];

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: ADMIN_PERMISSIONS,

  [UserRole.ADMINISTRATOR]: ADMIN_PERMISSIONS,

  [UserRole.USER]: USER_PERMISSIONS,
};
