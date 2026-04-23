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
import { Currency } from '../../../enums/currency.enum';
import { PaymentMethod } from '../../../enums/paymentMethod.enum';
import { Locale } from '../../../types/Locale';

export class CreateCashOrderDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  deliveryCost: number;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  merchantReference: string;

  @IsString()
  @IsOptional()
  transactionId: string | null;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
