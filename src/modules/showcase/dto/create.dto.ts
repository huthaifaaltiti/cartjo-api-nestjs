import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';

import { Locale } from 'src/types/Locale';
import { TypeHint } from 'src/enums/typeHint.enums';

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
  @IsNotEmpty()
  @MinLength(showAllButtonLinkMinChars)
  @MaxLength(showAllButtonLinkMaxChars)
  showAllButtonLink: string;

  @IsEnum(TypeHint)
  type: TypeHint;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  lang?: Locale = 'en';
}
