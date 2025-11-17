import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Currency } from 'src/enums/currency.enum';
import { Locale } from 'src/types/Locale';

export class MapLocation {
  lang: number;
  lat: number;
  name: string
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  town: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsOptional()
  building?: string;

  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @ValidateNested()
  @Type(() => MapLocation)
  @IsNotEmpty()
  mapLocation: MapLocation;
}

export class CheckoutBodyDto {
  @IsString()
  @IsNotEmpty()
  service_command: string;

  @IsString()
  @IsNotEmpty()
  merchant_identifier: string;

  @IsString()
  @IsNotEmpty()
  merchant_reference: string;

  @IsString()
  @IsNotEmpty()
  return_url: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  access_code: string;

  @IsString()
  @IsNotEmpty()
  expiry_date: string;

  @IsString()
  @IsNotEmpty()
  card_number: string;

  @IsString()
  @IsNotEmpty()
  card_security_code: string;

  @IsString()
  @IsNotEmpty()
  card_holder_name: string;

  @IsString()
  @IsOptional()
  language: Locale = 'en';

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency = Currency.JOD;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  amount: number;

  @IsNotEmpty()
  @IsString()
  customer_email: string;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;
}
