import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency } from 'src/enums/currency.enum';
import { Locale } from 'src/types/Locale';

export class CheckoutBodyDto {
  @IsString()
  @IsNotEmpty()
  token_name: string;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency = Currency.JOD;
}
