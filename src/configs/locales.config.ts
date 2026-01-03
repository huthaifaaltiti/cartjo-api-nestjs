export const ARABIC_LOCALES = ["ar"];

export const isArabicLocale = (locale: string): boolean => {
  return ARABIC_LOCALES.includes(locale.toLocaleLowerCase());
};
