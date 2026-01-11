import {
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
<<<<<<< HEAD
=======
import { OrderDeliveryStatus } from 'src/enums/orderDeliveryStatus.enum';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { Locale } from 'src/types/Locale';

export class GetOrdersQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  lastId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsNumberString()
  @IsOptional()
  amountMin?: string;

  @IsNumberString()
  @IsOptional()
  amountMax?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

<<<<<<< HEAD
=======
  @IsEnum(OrderDeliveryStatus)
  @IsOptional()
  deliveryStatus?: OrderDeliveryStatus;

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsISO8601()
  createdAfter?: string;

  @IsOptional()
  @IsISO8601()
  createdBefore?: string;

  @IsOptional()
  @IsISO8601()
  updatedAfter?: string;

  @IsOptional()
  @IsISO8601()
  updatedBefore?: string;
}
