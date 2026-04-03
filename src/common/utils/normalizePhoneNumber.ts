import { CountryPhoneConfig } from 'src/configs/countryPhone.config';

export const normalizePhoneNumber = (
  val: string,
  config: CountryPhoneConfig,
): string => {
  let cleaned = val.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith(`+${config.countryCode}`))
    cleaned = cleaned.slice(config.countryCode.length + 1);
  else if (cleaned.startsWith(`00${config.countryCode}`))
    cleaned = cleaned.slice(config.countryCode.length + 2);

  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);

  return cleaned;
};

export const isPhoneNumberLike = (
  value: string,
  config: CountryPhoneConfig,
): boolean => {
  const cleaned = normalizePhoneNumber(value, config);
  return /^7[789]\d{7}$/.test(cleaned);
};
