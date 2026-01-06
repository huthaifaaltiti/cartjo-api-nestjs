import { IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetConfigDto {
  @IsString()
  key: string;

  @IsString()
  @IsOptional()
  lang?: Locale = 'en';
}
