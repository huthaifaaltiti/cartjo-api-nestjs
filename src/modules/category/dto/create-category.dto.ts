import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { Locale } from 'src/types/Locale';
import { validationConfig } from 'src/configs/validationConfig';

const { nameMinChars, nameMaxChars } = validationConfig.category;

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category ar name is required' })
  @MinLength(nameMinChars, {
    message: `Category ar name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Category ar name cannot be more than (${nameMaxChars}) characters`,
  })
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Category en name is required' })
  @MinLength(nameMinChars, {
    message: `Category en name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Category en name cannot be more than (${nameMaxChars}) characters`,
  })
  name_en: string;

  @IsString()
  lang: Locale;
}
