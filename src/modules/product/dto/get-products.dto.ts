import { IsMongoId, IsOptional, IsString } from 'class-validator';

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
}
