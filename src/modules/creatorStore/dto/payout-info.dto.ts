import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Locale } from '../../../types/Locale';
import { PayoutMethod } from '../../../enums/payoutMethod.enum';
import { Currency } from '../../../enums/currency.enum';

/**
 * Replaces the calling creator's payout details. Submitting this always resets
 * the admin `isConfirmed` flag — the platform team must re-verify.
 */
export class UpdatePayoutInfoDto {
  @IsOptional()
  @IsEnum(PayoutMethod, { message: 'Invalid payout method' })
  method?: PayoutMethod;

  // Bank transfer
  @IsOptional() @IsString() @MaxLength(120) bankName?: string;
  @IsOptional() @IsString() @MaxLength(120) accountHolderName?: string;
  @IsOptional() @IsString() @MaxLength(64) iban?: string;
  @IsOptional() @IsString() @MaxLength(64) accountNumber?: string;
  @IsOptional() @IsString() @MaxLength(32) swiftCode?: string;

  // CliQ
  @IsOptional() @IsString() @MaxLength(64) cliqAlias?: string;

  /** Currency the creator wants to be paid in; falls back to the store currency. */
  @IsOptional()
  @IsEnum(Currency, { message: 'Invalid payout currency' })
  currency?: Currency;

  // Wallet
  @IsOptional() @IsString() @MaxLength(64) walletProvider?: string;
  @IsOptional() @IsString() @MaxLength(64) walletNumber?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
