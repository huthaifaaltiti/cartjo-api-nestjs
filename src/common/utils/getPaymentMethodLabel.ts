import { isArabicLocale } from 'src/configs/locales.config';
import { Locale } from 'src/types/Locale';
import { PaymentMethods } from '../constants/paymentMethods.constant';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';

const getPaymentMethodLabel = (lang: Locale, method: PaymentMethod): string => {
  const isArabic = isArabicLocale(lang);

  return isArabic
    ? PaymentMethods[method.toUpperCase()].labelAr
    : PaymentMethods[method.toUpperCase()].labelEn;
};

export default getPaymentMethodLabel;
