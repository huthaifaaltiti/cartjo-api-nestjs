import reservedHandles from './reservedHandles.config';

export const validationConfig = {
  password: {
    min: 8,
    max: 30,
    minMessage: 'Password must be at least 8 characters long',
    maxMessage: 'Password cannot exceed 30 characters',
  },
  category: {
    nameMinChars: 3,
    nameMaxChars: 50,
  },
  subCategory: {
    nameMinChars: 3,
    nameMaxChars: 50,
  },
  logo: {
    nameMinChars: 3,
    nameMaxChars: 50,
    altMinChars: 3,
    altMaxChars: 100,
  },
  banner: {
    titleMinChars: 3,
    titleMaxChars: 50,
    bannerLinkMinChars: 5,
    bannerLinkMaxChars: 255,
  },
  creators: {
    titleMinChars: 3,
    titleMaxChars: 100,
  },
  creatorStore: {
    nameMinChars: 2,
    nameMaxChars: 60,
    bioMinChars: 10,
    bioMaxChars: 1000,
    taglineMinChars: 3,
    taglineMaxChars: 120,
    handleMinChars: 5,
    handleMaxChars: 30,
    /** Slug-safe handle: letters, numbers, single dashes/underscores. */
    handlePattern: /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$/,
    /** A live store may change its handle at most once per this many days. */
    handleChangeCooldownDays: 30,
    /** How many past handles to keep per store for redirects / squat-blocking. */
    handleHistoryLimit: 10,
    /**
     * Handles nobody may take: reserved routes, brand terms and common traps.
     * Kept lowercase — the handle is always normalised before the check.
     */
    reservedHandles: reservedHandles,
    phoneMaxChars: 20,
    policyMaxChars: 2000,
    themeColorPattern: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    minCommissionRate: 0,
    maxCommissionRate: 100,
    defaultCommissionRate: 10,
    minOrderAmountMax: 1_000_000,
    statusReasonMinChars: 3,
    statusReasonMaxChars: 500,
  },
  showcase: {
    titleMinChars: 2,
    titleMaxChars: 100,
    descriptionMinChars: 5,
    descriptionMaxChars: 500,
    showAllButtonTextMinChars: 2,
    showAllButtonTextMaxChars: 50,
    showAllButtonLinkMinChars: 3,
    showAllButtonLinkMaxChars: 200,
  },
  typeHint: {
    labelMinChars: 3,
    labelMaxChars: 50,
    priorityMinNum: 1,
    priorityMaxNum: 10,
  },
  product: {
    name: {
      ar: {
        required: 'Product name (AR) is required',
        minCharacters: {
          value: 5,
          message: 'Product name (AR) cannot be less than 5 characters',
        },
        maxCharacters: {
          value: 300,
          message: 'Product name (AR) cannot exceed 300 characters',
        },
      },
      en: {
        required: 'Product name (EN) is required',
        minCharacters: {
          value: 5,
          message: 'Product name (EN) cannot be less than 5 characters',
        },
        maxCharacters: {
          value: 300,
          message: 'Product name (EN) cannot exceed 300 characters',
        },
      },
    },
    description: {
      ar: {
        required: 'Product description (AR) is required',
        minCharacters: {
          value: 10,
          message: 'Product description (AR) cannot be less than 10 characters',
        },
        maxCharacters: {
          value: 1000,
          message: 'Product description (AR) cannot exceed 1000 characters',
        },
      },
      en: {
        required: 'Product description (EN) is required',
        minCharacters: {
          value: 10,
          message: 'Product description (EN) cannot be less than 10 characters',
        },
        maxCharacters: {
          value: 1000,
          message: 'Product description (EN) cannot exceed 1000 characters',
        },
      },
    },
    typeHints: {
      required: 'Product type-hints are required',
    },
    category: {
      required: 'Category is required',
    },
    subCategory: {
      required: 'Sub-Category is required',
    },
    variant: {
      description: {
        ar: {
          required: 'Product variant description (AR) is required',
          minCharacters: {
            value: 10,
            message:
              'Product variant description (AR) cannot be less than 10 characters',
          },
          maxCharacters: {
            value: 1000,
            message:
              'Product variant description (AR) cannot exceed 1000 characters',
          },
        },
        en: {
          required: 'Product variant description (EN) is required',
          minCharacters: {
            value: 10,
            message:
              'Product variant description (EN) cannot be less than 10 characters',
          },
          maxCharacters: {
            value: 1000,
            message:
              'Product variant description (EN) cannot exceed 1000 characters',
          },
        },
      },
      price: {
        required: 'Product variant price is required',
        invalidType: 'Price count must be a number',
        min: {
          value: 0.05,
          message: 'Product variant price cannot be less than 0.05',
        },
        max: {
          value: 1000000,
          message: 'Product variant price cannot exceed 1,000,000',
        },
      },
      discountRate: {
        min: {
          value: 0,
          message: 'Product variant discount rate cannot be less than 0',
        },
        max: {
          value: 100,
          message: 'Product variant discount rate cannot exceed 100',
        },
        invalidType: 'Product variant discount rate must be a number',
      },
      availableCount: {
        min: {
          value: 1,
          message: 'Available count cannot be less than 1',
        },
        invalidType: 'Available count must be a number',
      },
      totalAmountCount: {
        min: {
          value: 1,
          message: 'Total amount count cannot be less than 1',
        },
        invalidType: 'Total amount count must be a number',
      },
      sku: {
        minCharacters: {
          value: 15,
          message: 'SKU cannot be empty, minimum 15 characters required',
        },
        maxCharacters: {
          value: 100,
          message: 'SKU cannot exceed 100 characters',
        },
      },
      tags: {
        invalidType: 'Tags must be an array of strings',
      },
    },
  },
};
