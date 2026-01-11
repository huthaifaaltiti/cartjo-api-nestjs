import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  ValidateNested,
<<<<<<< HEAD
} from 'class-validator';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { ShippingAddressDto } from 'src/modules/payment/dto/checkout.dto';
=======
  IsOptional,
} from 'class-validator';
import { Currency } from 'src/enums/currency.enum';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { ShippingAddressDto } from 'src/modules/payment/dto/checkout.dto';
import { Locale } from 'src/types/Locale';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

export class CreateOrderBodyDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

<<<<<<< HEAD
  @IsString()
  @IsNotEmpty()
  currency: string;
=======
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  merchantReference: string;

  @IsString()
<<<<<<< HEAD
  @IsNotEmpty()
  transactionId: string;
=======
  @IsOptional()
  transactionId: string | null;
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

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
