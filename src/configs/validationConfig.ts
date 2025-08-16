export const validationConfig = {
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
    keyMinChars: 3,
    keyMaxChars: 50,
    labelMinChars: 3,
    labelMaxChars: 50,
    iconMinChars: 3,
    iconMaxChars: 30,
    clrMinChars: 3,
    clrMaxChars: 12,
    priorityMinNum: 1,
    priorityMaxNum: 10,
  },
};
