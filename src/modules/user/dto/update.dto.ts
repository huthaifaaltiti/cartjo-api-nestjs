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
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../../enums/gender.enum';
import { NATIONALITY_CODES } from '../../../common/constants/nationalities';
import { Locale } from '../../../types/Locale';
import { ShippingAddressDto } from '../../payment/dto/checkout.dto';

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
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  newPassword?: string;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsIn(NATIONALITY_CODES)
  nationality?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  lang?: Locale;
}

export class UpdateUserParamsDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  id: string;
}
export class UpdateDefaultAddressDto {
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  lang?: Locale;
}
