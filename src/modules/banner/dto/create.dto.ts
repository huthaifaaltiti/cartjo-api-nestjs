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

const { titleMinChars, titleMaxChars, bannerLinkMinChars, bannerLinkMaxChars } =
  validationConfig.banner;

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
  @IsNotEmpty({ message: 'CTA button link is required' })
  @MinLength(bannerLinkMinChars)
  @MaxLength(bannerLinkMaxChars)
  link: string;

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
