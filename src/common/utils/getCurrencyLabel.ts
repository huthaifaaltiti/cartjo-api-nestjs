import { Locale } from '../../types/Locale';
import { Currency as CurrencyConstants } from '../constants/currency.constant';
import { Currency as CurrencyEnum } from '../../enums/currency.enum';
import { isArabicLocale } from '../../configs/locales.config';

const getCurrencyLabel = (lang: Locale, currency: CurrencyEnum): string => {
  const isArabic = isArabicLocale(lang);

  return isArabic
    ? CurrencyConstants[currency].labelAr
    : CurrencyConstants[currency].labelEn;
};

export default getCurrencyLabel;
