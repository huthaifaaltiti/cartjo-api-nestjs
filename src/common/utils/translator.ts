import * as en from '../../locales/en.json';
import * as ar from '../../locales/ar.json';

export const messages = { en, ar };

export const getMessage = (key: string, lang: 'en' | 'ar' = 'en'): string => {
  return messages[lang][key] || key;
};
