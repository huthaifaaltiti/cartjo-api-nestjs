import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';

import { Locale } from 'src/types/Locale';
import { validationConfig } from 'src/configs/validationConfig';
import { Transform } from 'class-transformer';

const {
  titleMinChars,
  titleMaxChars,
  ctaLabelMinChars,
  ctaLabelMaxChars,
  ctaLinkMinChars,
  ctaLinkMaxChars,
  ctaColorMinChars,
  ctaColorMaxChars,
} = validationConfig.banner;

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty({ message: 'Ar title is required' })
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'En title is required' })
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_en: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'withAction flag is required' })
  @Transform(({ value }) => value === 'true')
  withAction: boolean;

  @IsString()
  @IsNotEmpty({ message: 'CTA button Ar label text is required' })
  @MinLength(ctaLabelMinChars)
  @MaxLength(ctaLabelMaxChars)
  ctaBtn_labelEn: string;

  @IsString()
  @IsNotEmpty({ message: 'CTA button En label text is required' })
  @MinLength(ctaLabelMinChars)
  @MaxLength(ctaLabelMaxChars)
  ctaBtn_labelAr: string;

  @IsString()
  @IsNotEmpty({ message: 'CTA button label color is required' })
  @MinLength(ctaColorMinChars)
  @MaxLength(ctaColorMaxChars)
  ctaBtn_labelClr: string;

  @IsString()
  @IsNotEmpty({ message: 'CTA button text color is required' })
  @MinLength(ctaColorMinChars)
  @MaxLength(ctaColorMaxChars)
  ctaBtn_bgClr: string;

  @IsString()
  @IsNotEmpty({ message: 'CTA button link is required' })
  @MinLength(ctaLinkMinChars)
  @MaxLength(ctaLinkMaxChars)
  ctaBtn_link: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
