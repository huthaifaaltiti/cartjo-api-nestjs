import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';
import { Locale } from 'src/types/Locale';

const { nameMinChars, nameMaxChars } = validationConfig.category;

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(nameMinChars, {
    message: `Category ar name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Category ar name cannot be more than (${nameMaxChars}) characters`,
  })
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MinLength(nameMinChars, {
    message: `Category en name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Category en name cannot be more than (${nameMaxChars}) characters`,
  })
  name_en?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class UpdateCategoryParamsDto {
  @IsMongoId({ message: 'Invalid category ID format' })
  @IsNotEmpty({ message: 'Category ID is required' })
  id: string;
}
