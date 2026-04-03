export type CountryPhoneConfig = {
  countryCode: string; // e.g. "962"
  validPrefixes: string[]; // e.g. ["77", "78", "79"]
  localLength: number; // e.g. 9 (digits after country code, without leading 0)
};

export const COUNTRY_CONFIGS: Record<string, CountryPhoneConfig> = {
  JO: {
    countryCode: "962",
    validPrefixes: ["77", "78", "79"],
    localLength: 9,
  },
  // Future countries:
  // SA: {
  //   countryCode: "966",
  //   validPrefixes: ["5"],
  //   localLength: 9,
  // },
  // EG: {
  //   countryCode: "20",
  //   validPrefixes: ["10", "11", "12", "15"],
  //   localLength: 10,
  // },
};