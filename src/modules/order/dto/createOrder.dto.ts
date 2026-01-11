import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Currency } from 'src/enums/currency.enum';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { ShippingAddressDto } from 'src/modules/payment/dto/checkout.dto';
import { Locale } from 'src/types/Locale';

export class CreateOrderBodyDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

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
