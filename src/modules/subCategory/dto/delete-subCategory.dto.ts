import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class DeleteSubCategoryDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class DeleteSubCategoryParamsDto {
  @IsMongoId({ message: 'Invalid sub-category ID format' })
  @IsNotEmpty({ message: 'SubCategory ID is required' })
  id: string;
}
