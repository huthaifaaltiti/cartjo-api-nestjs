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
          value: 100,
          message: 'Product name (AR) cannot exceed 100 characters',
        },
      },
      en: {
        required: 'Product name (EN) is required',
        minCharacters: {
          value: 5,
          message: 'Product name (EN) cannot be less than 5 characters',
        },
        maxCharacters: {
          value: 100,
          message: 'Product name (EN) cannot exceed 100 characters',
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
          value: 300,
          message: 'Product description (AR) cannot exceed 300 characters',
        },
      },
      en: {
        required: 'Product description (EN) is required',
        minCharacters: {
          value: 10,
          message: 'Product description (EN) cannot be less than 10 characters',
        },
        maxCharacters: {
          value: 300,
          message: 'Product description (EN) cannot exceed 300 characters',
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
            value: 300,
            message:
              'Product variant description (AR) cannot exceed 300 characters',
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
            value: 300,
            message:
              'Product variant description (EN) cannot exceed 300 characters',
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
          value: 1,
          message: 'SKU cannot be empty',
        },
        maxCharacters: {
          value: 50,
          message: 'SKU cannot exceed 50 characters',
        },
      },
      tags: {
        invalidType: 'Tags must be an array of strings',
      },
    },
  },
};
