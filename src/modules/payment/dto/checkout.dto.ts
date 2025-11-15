import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency } from 'src/enums/currency.enum';
import { Locale } from 'src/types/Locale';

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
}
