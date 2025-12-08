import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ShippingAddressDto } from './checkout.dto';
import { Type } from 'class-transformer';
import { Currency } from 'src/enums/currency.enum';
import { Locale } from 'src/types/Locale';

export class CreateCashOrderDto {
  @IsString()
  @IsOptional()
  language: Locale = 'en';

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency = Currency.JOD;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  customer_email: string;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;
}
