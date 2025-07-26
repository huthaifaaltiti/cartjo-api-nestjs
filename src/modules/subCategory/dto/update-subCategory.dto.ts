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

const { nameMinChars, nameMaxChars } = validationConfig.subCategory;

export class UpdateSubCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(nameMinChars, {
    message: `Sub-Category ar name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Sub-Category ar name cannot be more than (${nameMaxChars}) characters`,
  })
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MinLength(nameMinChars, {
    message: `Sub-Category en name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Sub-Category en name cannot be more than (${nameMaxChars}) characters`,
  })
  name_en?: string;

  @IsMongoId({ message: 'Invalid Category ID format' })
  @IsOptional()
  categoryId: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class UpdateSubCategoryParamsDto {
  @IsMongoId({ message: 'Invalid sub-category ID format' })
  @IsNotEmpty({ message: 'SubCategory ID is required' })
  id: string;
}
