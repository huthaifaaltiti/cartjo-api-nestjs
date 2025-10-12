import {
  IsOptional,
  IsEmail,
  IsString,
  IsBoolean,
  IsPhoneNumber,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { Locale } from 'src/types/Locale';
import { Gender } from 'src/enums/gender.enum';

export class UpdateUserDto {
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
  @IsPhoneNumber('JO')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender; 

  @IsOptional()
  @IsDateString()
  birthDate?: string; 

  @IsOptional()
  @IsString()
  lang?: Locale;
}

export class UpdateUserParamsDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  id: string;
}
