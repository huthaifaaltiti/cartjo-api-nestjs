import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';

import { Locale } from 'src/types/Locale';

const {
  titleMinChars,
  titleMaxChars,
  descriptionMinChars,
  descriptionMaxChars,
  showAllButtonTextMinChars,
  showAllButtonTextMaxChars,
  showAllButtonLinkMinChars,
  showAllButtonLinkMaxChars,
} = validationConfig.showcase;

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_ar: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_en: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(descriptionMinChars)
  @MaxLength(descriptionMaxChars)
  description_ar: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(descriptionMinChars)
  @MaxLength(descriptionMaxChars)
  description_en: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(showAllButtonTextMinChars)
  @MaxLength(showAllButtonTextMaxChars)
  showAllButtonText_ar: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(showAllButtonTextMinChars)
  @MaxLength(showAllButtonTextMaxChars)
  showAllButtonText_en: string;

  @IsString()
  @IsOptional()
  @MinLength(showAllButtonLinkMinChars)
  @MaxLength(showAllButtonLinkMaxChars)
  showAllButtonLink: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  lang?: Locale = 'en';
}
