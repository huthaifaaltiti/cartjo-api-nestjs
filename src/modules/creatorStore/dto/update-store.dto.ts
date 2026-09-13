import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Locale } from '../../../types/Locale';
import { validationConfig } from '../../../configs/validationConfig';
import { Currency } from '../../../enums/currency.enum';
import { CreatorStoreBusinessType } from '../../../enums/creatorStoreBusinessType.enum';

const c = validationConfig.creatorStore;

/**
 * Partial update of the calling creator's own store profile (JSON body).
 * Branding files (`logo` / `banner`) have a dedicated multipart endpoint,
 * payout details have `PUT /creator-store/payout-info`, and the pickup address
 * has `PUT /creator-store/pickup-address` — none of those fields belong here.
 * The public `handle` has its own rate-limited `change-handle` endpoint and is
 * intentionally not accepted here. `commissionRate`, `status` and verification
 * flags are intentionally absent — only admins can touch those.
 */
export class UpdateCreatorStoreDto {
  @IsOptional()
  @IsString()
  @MinLength(c.nameMinChars)
  @MaxLength(c.nameMaxChars)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MinLength(c.nameMinChars)
  @MaxLength(c.nameMaxChars)
  name_en?: string;

  @IsOptional()
  @IsString()
  @MinLength(c.bioMinChars)
  @MaxLength(c.bioMaxChars)
  bio_ar?: string;

  @IsOptional()
  @IsString()
  @MinLength(c.bioMinChars)
  @MaxLength(c.bioMaxChars)
  bio_en?: string;

  @IsOptional()
  @IsString()
  @MaxLength(c.taglineMaxChars)
  tagline_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(c.taglineMaxChars)
  tagline_en?: string;

  @IsOptional()
  @IsString()
  @Matches(c.themeColorPattern, { message: 'themeColor must be a hex colour' })
  themeColor?: string;

  @IsOptional() @IsString() countryCode?: string;

  @IsOptional() @IsString() @MaxLength(c.phoneMaxChars) phone?: string;

  @IsOptional() @IsEmail({}, { message: 'Invalid store email' }) email?: string;

  @IsOptional() @IsEnum(Currency) currency?: Currency;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'minOrderAmount must be a number' })
  @Min(0)
  @Max(c.minOrderAmountMax)
  minOrderAmount?: number;

  @IsOptional()
  @IsEnum(CreatorStoreBusinessType)
  businessType?: CreatorStoreBusinessType;

  @IsOptional() @IsString() @MaxLength(120) registrationNumber?: string;
  @IsOptional() @IsString() @MaxLength(120) taxId?: string;

  // --- Social links (send empty string to clear a link) ---
  @IsOptional() @IsString() social_instagram?: string;
  @IsOptional() @IsString() social_facebook?: string;
  @IsOptional() @IsString() social_tiktok?: string;
  @IsOptional() @IsString() social_youtube?: string;
  @IsOptional() @IsString() social_x?: string;
  @IsOptional() @IsString() social_snapchat?: string;
  @IsOptional() @IsString() social_whatsapp?: string;
  @IsOptional() @IsString() social_telegram?: string;
  @IsOptional() @IsString() social_website?: string;

  // --- Policies ---
  @IsOptional()
  @IsString()
  @MaxLength(c.policyMaxChars)
  policy_return_ar?: string;
  @IsOptional()
  @IsString()
  @MaxLength(c.policyMaxChars)
  policy_return_en?: string;
  @IsOptional()
  @IsString()
  @MaxLength(c.policyMaxChars)
  policy_shipping_ar?: string;
  @IsOptional()
  @IsString()
  @MaxLength(c.policyMaxChars)
  policy_shipping_en?: string;
  @IsOptional()
  @IsString()
  @MaxLength(c.policyMaxChars)
  policy_exchange_ar?: string;
  @IsOptional()
  @IsString()
  @MaxLength(c.policyMaxChars)
  policy_exchange_en?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  policy_returnWindowDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(90)
  policy_processingTimeDays?: number;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
