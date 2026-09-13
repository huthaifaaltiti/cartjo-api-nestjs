export enum PayoutMethod {
  /** Local/international bank wire transfer. */
  BANK_TRANSFER = 'BANK_TRANSFER',

  /** Jordan CliQ instant payment alias. */
  CLIQ = 'CLIQ',

  /** Mobile / digital wallet (e.g. Zain Cash, Orange Money, ...). */
  WALLET = 'WALLET',
}
