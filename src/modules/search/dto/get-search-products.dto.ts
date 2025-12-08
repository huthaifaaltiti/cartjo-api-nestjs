import {
  IsDateString,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class SearchProductsQueryDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  lang?: 'en' | 'ar';

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  typeHint?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  lastId?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  subCategoryId?: string;

  @IsOptional()
  @IsNumberString()
  priceFrom?: string;

  @IsOptional()
  @IsNumberString()
  priceTo?: string;

  @IsOptional()
  @IsNumberString()
  ratingTo?: string;

  @IsOptional()
  @IsNumberString()
  ratingFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string; // e.g. "2025-09-23T08:00:00.000Z"

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsNumberString()
  beforeNumOfDays?: string;
}
