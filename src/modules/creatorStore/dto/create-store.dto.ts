import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
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
import { Locale as LocaleEnum } from '../../../enums/locale.enum';

const c = validationConfig.creatorStore;

export class CreateCreatorStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'Arabic store name is required' })
  @MinLength(c.nameMinChars)
  @MaxLength(c.nameMaxChars)
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'English store name is required' })
  @MinLength(c.nameMinChars)
  @MaxLength(c.nameMaxChars)
  name_en: string;

  @IsString()
  @IsNotEmpty({ message: 'Store handle is required' })
  @Matches(c.handlePattern, {
    message: `Handle must be ${c.handleMinChars}-${c.handleMaxChars} chars, lowercase letters, numbers, dashes or underscores`,
  })
  handle: string;

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
  @Matches(c.themeColorPattern, { message: 'themeColor must be a hex color' })
  themeColor?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(c.phoneMaxChars)
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid store email' })
  email?: string;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.JOD;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minOrderAmount must be a number' })
  @Min(0)
  @Max(c.minOrderAmountMax)
  @Transform(({ value }) => Number(value))
  minOrderAmount?: number;

  @IsOptional()
  @IsEnum(CreatorStoreBusinessType)
  businessType?: CreatorStoreBusinessType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  taxId?: string;

  @IsOptional() @IsString() social_instagram?: string;
  @IsOptional() @IsString() social_facebook?: string;
  @IsOptional() @IsString() social_tiktok?: string;
  @IsOptional() @IsString() social_youtube?: string;
  @IsOptional() @IsString() social_x?: string;
  @IsOptional() @IsString() social_snapchat?: string;
  @IsOptional() @IsString() social_whatsapp?: string;
  @IsOptional() @IsString() social_telegram?: string;
  @IsOptional() @IsString() social_website?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = LocaleEnum.EN;
}
