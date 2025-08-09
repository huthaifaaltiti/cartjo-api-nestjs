import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';
import { Locale } from 'src/types/Locale';

const { bannerLinkMinChars, bannerLinkMaxChars, titleMinChars, titleMaxChars } =
  validationConfig.banner;

export class UpdateBannerDto {
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

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  withAction: boolean;

  @ValidateIf(o => o.withAction === true)
  @IsString()
  @IsOptional()
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

export class UpdateBannerParamsDto {
  @IsMongoId({ message: 'Invalid banner ID format' })
  @IsNotEmpty({ message: 'Banner ID is required' })
  id: string;
}
