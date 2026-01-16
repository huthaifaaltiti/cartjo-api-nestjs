import { IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetUserContextQuery {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
