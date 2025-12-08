import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { Locale } from 'src/types/Locale';

export class ChangePaymentStatusBodyDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  status: PaymentStatus.PAID | PaymentStatus.PENDING;

  @IsString()
  @IsOptional()
  lang: Locale;
}
