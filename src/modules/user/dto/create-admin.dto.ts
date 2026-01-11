<<<<<<< HEAD
import { Transform } from 'class-transformer';
import {
  IsBoolean,
=======
import {
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class CreateAdminBodyDto {
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

  @IsString()
  @IsNotEmpty()
  termsAccepted: string;

  @IsString()
  @IsOptional()
  marketingEmails?: string;

  @IsString()
  lang: Locale;
}
