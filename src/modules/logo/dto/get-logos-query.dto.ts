import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class GetLogosQueryDto {
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
