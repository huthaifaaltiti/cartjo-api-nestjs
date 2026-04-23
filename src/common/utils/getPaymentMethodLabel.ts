import { isArabicLocale } from '../../configs/locales.config';
import { PaymentMethod } from '../../enums/paymentMethod.enum';
import { Locale } from '../../types/Locale';
import { PaymentMethods } from '../constants/paymentMethods.constant';

const getPaymentMethodLabel = (lang: Locale, method: PaymentMethod): string => {
  const isArabic = isArabicLocale(lang);

  return isArabic
    ? PaymentMethods[method.toUpperCase()].labelAr
    : PaymentMethods[method.toUpperCase()].labelEn;
};

export default getPaymentMethodLabel;
