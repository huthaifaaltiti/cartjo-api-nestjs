import { IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class GetMeQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
