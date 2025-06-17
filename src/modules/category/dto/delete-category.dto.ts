import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class DeleteCategoryDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class DeleteCategoryParamsDto {
  @IsMongoId({ message: 'Invalid category ID format' })
  @IsNotEmpty({ message: 'Category ID is required' })
  id: string;
}
