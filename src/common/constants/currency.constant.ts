export const Currency = {
  JOD: { code: "JOD", labelAr: "دينار أردني", labelEn: "JO Dinar" },
  USD: { code: "USD", labelAr: "دولار أمريكي", labelEn: "US Dollar" },
} as const;

export type CurrencyKey = keyof typeof Currency;
