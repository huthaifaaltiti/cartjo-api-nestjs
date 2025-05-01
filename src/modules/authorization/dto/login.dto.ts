import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Identifier is required' })
  @Matches(/^(\d{9,15}|\S+@\S+\.\S+)$/, {
    message: 'Identifier must be a valid phone number or email address',
  })
  identifier: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
  password: string;

  @IsBoolean({ message: 'Remember me must be a boolean value' })
  @IsOptional()
  rememberMe: boolean;

  @IsIn(['en', 'ar'], { message: 'Language must be either "en" or "ar"' })
  lang: 'en' | 'ar';
}
