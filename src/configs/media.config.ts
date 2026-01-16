export const MEDIA_CONFIG = {
  CATEGORY: {
    IMAGE: {
      ALLOWED_TYPES: ['webp', 'gif', 'avif', 'png', 'jpg', 'jpeg', 'tiff'],
      MAX_SIZE: 1 * 1024 * 1024,
    },
  },
  SUB_CATEGORY: {
    IMAGE: {
      ALLOWED_TYPES: ['webp', 'gif', 'avif', 'png', 'jpg', 'jpeg', 'tiff'],
      MAX_SIZE: 1 * 1024 * 1024,
    },
  },
  BANNER: {
    IMAGE: {
      ALLOWED_TYPES: ['webp', 'gif', 'avif', 'png', 'jpg', 'jpeg', 'tiff'],
      MAX_SIZE: 3 * 1024 * 1024,
    },
  },
  LOGO: {
    IMAGE: {
      ALLOWED_TYPES: ['webp', 'gif', 'avif', 'png', 'jpg', 'jpeg', 'tiff'],
      MAX_SIZE: 1 * 1024 * 1024,
    },
  },
  PRODUCT: {
    IMAGE: {
      ALLOWED_TYPES: ['webp', 'gif', 'avif', 'png', 'jpg', 'jpeg', 'tiff'],
      MAX_SIZE: 2 * 1024 * 1024,
    },
  },
  USER: {
    PROFILE_IMAGE: {
      ALLOWED_TYPES: ['webp', 'gif', 'avif', 'png', 'jpg', 'jpeg', 'tiff'],
      MAX_SIZE: 1 * 1024 * 1024,
    },
  },
  LOCATION: {
    BULK_UPLOAD_FILE: {
      ALLOWED_TYPES: ['xlsx', 'xlsm', 'xlsb', 'xls'],
      MAX_SIZE: 5 * 1024 * 1024,
    },
  },
  OTHERS: {
    ANY: {
      ALLOWED_TYPES: ['*'], 
      MAX_SIZE: null,
    },
  },
};
