import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetSuggestedProductsQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsOptional()
  @IsString()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  subCategoryId?: string;
}
