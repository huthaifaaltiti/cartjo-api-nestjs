import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';
import { Locale } from 'src/types/Locale';

const {
  labelMinChars,
  labelMaxChars,
  titleMinChars,
  titleMaxChars,
  subTitleMinChars,
  subTitleMaxChars,
  ctaTextMinChars,
  ctaTextMaxChars,
  ctaLinkMinChars,
  ctaLinkMaxChars,
  offerDescMinChars,
  offerDescMaxChars,
} = validationConfig.banner;

export class UpdateBannerDto {
  // ---------------- Label ----------------
  @IsString()
  @IsOptional()
  @MinLength(labelMinChars)
  @MaxLength(labelMaxChars)
  label_ar: string;

  @IsString()
  @IsOptional()
  @MinLength(labelMinChars)
  @MaxLength(labelMaxChars)
  label_en: string;

  // ---------------- Title ----------------
  @IsString()
  @IsOptional()
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_ar: string;

  @IsString()
  @IsOptional()
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_en: string;

  // ---------------- SubTitle ----------------
  @IsString()
  @IsOptional()
  @MinLength(subTitleMinChars)
  @MaxLength(subTitleMaxChars)
  subTitle_ar: string;

  @IsString()
  @IsOptional()
  @MinLength(subTitleMinChars)
  @MaxLength(subTitleMaxChars)
  subTitle_en: string;

  // ---------------- CTA Button ----------------
  @IsString()
  @IsOptional()
  @MinLength(ctaTextMinChars)
  @MaxLength(ctaTextMaxChars)
  ctaBtn_text: string;

  @IsString()
  @IsOptional()
  @MinLength(ctaLinkMinChars)
  @MaxLength(ctaLinkMaxChars)
  ctaBtn_link: string;

  // ---------------- Offer Details ----------------
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  offerDetails_preSalePrice: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  offerDetails_afterSalePrice: number;

  @IsString()
  @IsOptional()
  @MinLength(offerDescMinChars)
  @MaxLength(offerDescMaxChars)
  offerDetails_desc: string;

  // ---------------- Misc ----------------
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';

  // ---------------- Active Duration ----------------
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;
}

export class UpdateBannerParamsDto {
  @IsMongoId({ message: 'Invalid banner ID format' })
  @IsNotEmpty({ message: 'Banner ID is required' })
  id: string;
}
