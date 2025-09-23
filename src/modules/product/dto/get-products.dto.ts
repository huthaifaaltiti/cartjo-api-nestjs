import {
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

import { Locale } from 'src/types/Locale';

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  lastId?: string;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsOptional()
  @IsString()
  @IsMongoId()
  categoryId?: string;

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
}
