import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from '../../../types/Locale';
import { Currency } from '../../../enums/currency.enum';

export class VerifyPaymentBodyDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsNotEmpty()
  @IsString()
  encryptedOrder: string;
}

export class ProcessPaymentBodyDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency = Currency.JOD;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  customer_email: string;
}
