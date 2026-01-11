import { isArabicLocale } from 'src/configs/locales.config';
import { Locale } from 'src/types/Locale';
import { Currency as CurrencyConstants } from '../constants/currency.constant';
import { Currency as CurrencyEnum } from 'src/enums/currency.enum';

const getCurrencyLabel = (lang: Locale, currency: CurrencyEnum): string => {
  const isArabic = isArabicLocale(lang);

  return isArabic
    ? CurrencyConstants[currency].labelAr
    : CurrencyConstants[currency].labelEn;
};

export default getCurrencyLabel;
