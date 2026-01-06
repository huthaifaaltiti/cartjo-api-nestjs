import { IsObject, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateConfigDto {
  @IsObject()
  value: Record<string, any>;

  @IsString()
  @IsOptional()
  lang?: Locale = 'en';
}
