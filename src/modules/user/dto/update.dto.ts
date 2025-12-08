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
} from 'class-validator';
import { Locale } from 'src/types/Locale';
import { Gender } from 'src/enums/gender.enum';
import { ShippingAddressDto } from 'src/modules/payment/dto/checkout.dto';
import { Type } from 'class-transformer';

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
export class UpdateDefaultAddressDto {
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  lang?: Locale;
}
