import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateSubCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(5, {
    message: 'SubCategory ar name cannot be less than 5 characters',
  })
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, {
    message: 'SubCategory en name cannot be less than 5 characters',
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
