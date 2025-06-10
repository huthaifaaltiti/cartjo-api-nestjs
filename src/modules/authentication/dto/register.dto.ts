import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
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

  @IsString({ message: 'Terms acceptance must be a string value' })
  @IsNotEmpty({ message: 'You must accept the terms' })
  termsAccepted: string;

  @IsString({ message: 'Marketing emails preference must be a string value' })
  marketingEmails?: string;

  @IsString()
  lang: Locale;
}
