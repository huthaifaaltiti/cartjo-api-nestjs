export enum Permission {
  // Users
  USERS_READ = 'users.read',
  USERS_CREATE = 'users.create',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',
  USERS_RESTORE = 'users.restore',
  USERS_ACTIVATE = 'users.activate',
  USERS_DEACTIVATE = 'users.deactivate',

  // Categories
  CATEGORIES_READ = 'categories.read',
  CATEGORIES_CREATE = 'categories.create',
  CATEGORIES_UPDATE = 'categories.update',
  CATEGORIES_DELETE = 'categories.delete',
  CATEGORIES_RESTORE = 'categories.restore',
  CATEGORIES_ACTIVATE = 'categories.activate',
  CATEGORIES_DEACTIVATE = 'categories.deactivate',

  // Sub-Categories
  SUB_CATEGORIES_READ = 'sub_categories.read',
  SUB_CATEGORIES_CREATE = 'sub_categories.create',
  SUB_CATEGORIES_UPDATE = 'sub_categories.update',
  SUB_CATEGORIES_DELETE = 'sub_categories.delete',
  SUB_CATEGORIES_RESTORE = 'sub_categories.restore',
  SUB_CATEGORIES_ACTIVATE = 'sub_categories.activate',
  SUB_CATEGORIES_DEACTIVATE = 'sub_categories.deactivate',

  // Products
  PRODUCTS_READ = 'products.read',
  PRODUCTS_CREATE = 'products.create',
  PRODUCTS_UPDATE = 'products.update',
  PRODUCTS_DELETE = 'products.delete',
  PRODUCTS_RESTORE = 'products.restore',
  PRODUCTS_ACTIVATE = 'products.activate',
  PRODUCTS_DEACTIVATE = 'products.deactivate',

  // Logos
  LOGOS_READ = 'logos.read',
  LOGOS_CREATE = 'logos.create',
  LOGOS_UPDATE = 'logos.update',
  LOGOS_DELETE = 'logos.delete',
  LOGOS_RESTORE = 'logos.restore',
  LOGOS_ACTIVATE = 'logos.activate',
  LOGOS_DEACTIVATE = 'logos.deactivate',

  // Banners
  BANNERS_READ = 'banners.read',
  BANNERS_CREATE = 'banners.create',
  BANNERS_UPDATE = 'banners.update',
  BANNERS_DELETE = 'banners.delete',
  BANNERS_RESTORE = 'banners.restore',
  BANNERS_ACTIVATE = 'banners.activate',
  BANNERS_DEACTIVATE = 'banners.deactivate',

  // Type Hints
  TYPE_HINT_CONFIGS_READ = 'type_hint_configs.read',
  TYPE_HINT_CONFIGS_CREATE = 'type_hint_configs.create',
  TYPE_HINT_CONFIGS_UPDATE = 'type_hint_configs.update',
  TYPE_HINT_CONFIGS_DELETE = 'type_hint_configs.delete',
  TYPE_HINT_CONFIGS_RESTORE = 'type_hint_configs.restore',
  TYPE_HINT_CONFIGS_ACTIVATE = 'type_hint_configs.activate',
  TYPE_HINT_CONFIGS_DEACTIVATE = 'type_hint_configs.deactivate',

  // Showcases
  SHOWCASES_READ = 'showcases.read',
  SHOWCASES_CREATE = 'showcases.create',
  SHOWCASES_UPDATE = 'showcases.update',
  SHOWCASES_DELETE = 'showcases.delete',
  SHOWCASES_RESTORE = 'showcases.restore',
  SHOWCASES_ACTIVATE = 'showcases.activate',
  SHOWCASES_DEACTIVATE = 'showcases.deactivate',

  // Orders
  ORDERS_READ = 'orders.read',
  ORDERS_CREATE = 'orders.create',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_DELETE = 'orders.delete',
  ORDERS_RESTORE = 'orders.restore',
  ORDERS_CANCEL = 'orders.cancel',
  ORDERS_REFUND = 'orders.refund',
  ORDERS_EXPORT = 'orders.export',
  ORDERS_CHANGE_PAYMENT_STATUS = 'orders.change_payment_status',
  ORDERS_CHANGE_DELIVERY_STATUS = 'orders.change_delivery_status',

  // Customer Orders
  ORDERS_READ_OWN = 'orders.read_own',
  ORDERS_CREATE_OWN = 'orders.create_own',

  // Reviews
  REVIEWS_READ = 'reviews.read',
  REVIEWS_CREATE = 'reviews.create',
  REVIEWS_UPDATE = 'reviews.update',
  REVIEWS_DELETE = 'reviews.delete',

  // Customer Reviews
  REVIEWS_READ_OWN = 'reviews.read_own',
  REVIEWS_UPDATE_OWN = 'reviews.update_own',
  REVIEWS_DELETE_OWN = 'reviews.delete_own',

  // Profile
  PROFILE_READ = 'profile.read',
  PROFILE_UPDATE = 'profile.update',

  // Wishlist
  WISHLIST_READ = 'wishlist.read',
  WISHLIST_UPDATE = 'wishlist.update',

  // Cart
  CART_READ = 'cart.read',
  CART_UPDATE = 'cart.update',

  // Dashboard
  DASHBOARD_ACCESS = 'dashboard.access',

  // Creators Videos
  CREATORS_VIDEOS_READ = 'creators_videos.read',
  CREATORS_VIDEOS_CREATE = 'creators_videos.create',
  CREATORS_VIDEOS_UPDATE = 'creators_videos.update',
  CREATORS_VIDEOS_DELETE = 'creators_videos.delete',
  CREATORS_VIDEOS_RESTORE = 'creators_videos.restore',
  CREATORS_VIDEOS_ACTIVATE = 'creators_videos.activate',
  CREATORS_VIDEOS_DEACTIVATE = 'creators_videos.deactivate',
}
