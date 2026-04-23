import { IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';
export class GetListQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
