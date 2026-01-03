import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { Locale } from 'src/types/Locale';

export class ChangePaymentStatusBodyDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @IsString()
  @IsOptional()
  lang: Locale;
}
