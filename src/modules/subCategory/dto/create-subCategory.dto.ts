import { IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class CreateSubCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Sub-Category ar name is required' })
  @MinLength(5, { message: 'Sub-Category ar name cannot be empty' })
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Sub-Category en name is required' })
  @MinLength(5, { message: 'Sub-Category en name cannot be empty' })
  name_en: string;

  @IsMongoId({ message: 'Invalid Category ID format' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString()
  lang: Locale;
}
