import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Locale as LocaleEnum } from '../../../enums/locale.enum';
import { Locale } from '../../../types/Locale';

export class LogoutDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;

  @IsString()
  @IsOptional()
  @IsEnum(LocaleEnum)
  lang: Locale;
}
