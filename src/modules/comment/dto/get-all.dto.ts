import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetCommentsQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsString()
  @IsMongoId()
  productId: string;

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
