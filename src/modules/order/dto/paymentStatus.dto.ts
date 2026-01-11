<<<<<<< HEAD
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
=======
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { Locale } from 'src/types/Locale';

export class ChangePaymentStatusBodyDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

<<<<<<< HEAD
  @IsString()
  @IsNotEmpty()
  status: PaymentStatus.PAID | PaymentStatus.PENDING;
=======
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

  @IsString()
  @IsOptional()
  lang: Locale;
}
