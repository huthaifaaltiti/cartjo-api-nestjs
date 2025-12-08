import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';
import { Locale } from 'src/types/Locale';

const { nameMinChars, nameMaxChars } = validationConfig.subCategory;

export class CreateSubCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Sub-Category ar name is required' })
  @MinLength(nameMinChars, {
    message: `Sub-Category ar name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Sub-Category ar name cannot be more than (${nameMaxChars}) characters`,
  })
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Sub-Category en name is required' })
  @MinLength(nameMinChars, {
    message: `Sub-Category en name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Sub-Category en name cannot be more than (${nameMaxChars}) characters`,
  })
  name_en: string;

  @IsMongoId({ message: 'Invalid Category ID format' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString()
  lang: Locale;
}
