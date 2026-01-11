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
<<<<<<< HEAD

export class CreateCashOrderDto {
  @IsString()
  @IsOptional()
  language: Locale = 'en';

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency = Currency.JOD;

=======
import { PaymentMethod } from 'src/enums/paymentMethod.enum';

export class CreateCashOrderDto {
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  @IsNumber()
  @IsNotEmpty()
  amount: number;

<<<<<<< HEAD
  @IsString()
  @IsNotEmpty()
  customer_email: string;
=======
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
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;
<<<<<<< HEAD
=======

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
}
