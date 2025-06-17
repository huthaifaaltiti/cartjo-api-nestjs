import { IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Category ar name cannot be empty' })
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Category en name cannot be empty' })
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
