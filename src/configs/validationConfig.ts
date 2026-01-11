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
};
