import { IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class GetUsersStatsQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
