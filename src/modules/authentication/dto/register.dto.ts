import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';
import { Locale } from 'src/types/Locale';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(1, { message: 'First name cannot be empty' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  lastName: string;
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(1, { message: 'Phone number cannot be empty' })
  phoneNumber: string;

  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
  password: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'You must accept the terms' })
  termsAccepted: string;

  @IsBoolean()
  @IsOptional()
  marketingEmails?: string;

  @IsEnum(PreferredLanguage)
  preferredLang: PreferredLanguage;

  @IsString()
  lang: Locale;
}

export class VerifyEmailQueryDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsString()
  lang: Locale;
}


export class ResendVerificationEmailDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  lang: Locale;
}

export class ForgotPasswordBodyDto {
  @IsNotEmpty({ message: 'Identifier is required' })
  identifier: string | number;

  @IsString()
  lang: Locale;
}
export class VerifyResetPasswordCodeBodyDto {
  @IsNotEmpty({ message: 'Identifier is required' })
  identifier: string | number;

  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsString()
  lang: Locale;
}

export class ResetPasswordBodyDto {
  @IsNotEmpty({ message: 'Identifier is required' })
  identifier: string | number;

  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
  newPassword: string;

  @IsString()
  lang: Locale;
}