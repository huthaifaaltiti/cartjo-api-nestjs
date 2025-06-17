import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category ar name is required' })
  @MinLength(5, { message: 'Category ar name cannot be empty' })
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Category en name is required' })
  @MinLength(5, { message: 'Category en name cannot be empty' })
  name_en: string;

  @IsString()
  lang: Locale;
}
