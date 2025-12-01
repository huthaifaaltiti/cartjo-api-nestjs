import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { validationConfig } from 'src/configs/validationConfig';
import { Locale as LocaleEnum } from 'src/enums/locale.enum';
import { Locale } from 'src/types/Locale';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Identifier is required' })
  @Matches(
    /^((\d{9,15})|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|([a-zA-Z0-9_.-]{3,30}))$/,
    {
      message:
        'Identifier must be a valid phone number, email address, or username',
    },
  )
  identifier: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(validationConfig.password.min, {
    message: validationConfig.password.minMessage,
  })
  @MaxLength(validationConfig.password.max, {
    message: validationConfig.password.maxMessage,
  })
  password: string;

  @IsBoolean()
  @IsOptional()
  rememberMe: boolean;

  @IsString()
  @IsOptional()
  @IsEnum(LocaleEnum)
  lang: Locale;
}
