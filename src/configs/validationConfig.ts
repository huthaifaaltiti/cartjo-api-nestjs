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
    labelMinChars: 3,
    labelMaxChars: 50,
    titleMinChars: 3,
    titleMaxChars: 100,
    subTitleMinChars: 3,
    subTitleMaxChars: 100,

    // CTA button
    ctaTextMinChars: 2,
    ctaTextMaxChars: 50,
    ctaLinkMinChars: 5,
    ctaLinkMaxChars: 255,

    // Offer details
    offerDescMinChars: 5,
    offerDescMaxChars: 255,
  },
};
