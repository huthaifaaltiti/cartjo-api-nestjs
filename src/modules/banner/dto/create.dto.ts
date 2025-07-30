import { 
  IsNotEmpty, 
  IsString, 
  MaxLength, 
  MinLength, 
  IsNumber, 
  IsOptional, 
} from 'class-validator';

import { Locale } from 'src/types/Locale';
import { validationConfig } from 'src/configs/validationConfig';

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

export class CreateBannerDto {
  // ---------------- Label ----------------
  @IsString()
  @IsNotEmpty({ message: 'Banner label (AR) is required' })
  @MinLength(labelMinChars)
  @MaxLength(labelMaxChars)
  label_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Banner label (EN) is required' })
  @MinLength(labelMinChars)
  @MaxLength(labelMaxChars)
  label_en: string;

  // ---------------- Title ----------------
  @IsString()
  @IsNotEmpty({ message: 'Banner title (AR) is required' })
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Banner title (EN) is required' })
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_en: string;

  // ---------------- SubTitle ----------------
  @IsString()
  @IsNotEmpty({ message: 'Banner sub-title (AR) is required' })
  @MinLength(subTitleMinChars)
  @MaxLength(subTitleMaxChars)
  subTitle_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Banner sub-title (EN) is required' })
  @MinLength(subTitleMinChars)
  @MaxLength(subTitleMaxChars)
  subTitle_en: string;

  // ---------------- CTA Button ----------------
  @IsString()
  @IsNotEmpty({ message: 'CTA button text is required' })
  @MinLength(ctaTextMinChars)
  @MaxLength(ctaTextMaxChars)
  ctaBtn_text: string;

  @IsString()
  @IsNotEmpty({ message: 'CTA button link is required' })
  @MinLength(ctaLinkMinChars)
  @MaxLength(ctaLinkMaxChars)
  ctaBtn_link: string;

  // ---------------- Offer Details ----------------
  @IsNumber()
  @IsNotEmpty({ message: 'Offer pre-sale price is required' })
  offerDetails_preSalePrice: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Offer after-sale price is required' })
  offerDetails_afterSalePrice: number;

  @IsString()
  @IsNotEmpty({ message: 'Offer description is required' })
  @MinLength(offerDescMinChars)
  @MaxLength(offerDescMaxChars)
  offerDetails_desc: string;

  // ---------------- Misc ----------------
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
