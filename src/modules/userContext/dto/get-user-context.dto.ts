import { IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class GetUserContextQuery {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
