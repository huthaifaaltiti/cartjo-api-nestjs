import {
  IsOptional,
  IsEmail,
  IsString,
  IsBoolean,
  IsPhoneNumber,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsString()
  lang?: Locale;
}

export class UpdateAdminUserParamsDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  id: string;
}
