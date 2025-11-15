import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency } from 'src/enums/currency.enum';
import { Locale } from 'src/types/Locale';

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
