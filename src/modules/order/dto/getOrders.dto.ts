import {
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from '../../../types/Locale';
import { PaymentStatus } from '../../../enums/paymentStatus.enum';
import { OrderDeliveryStatus } from '../../../enums/orderDeliveryStatus.enum';
import { PaymentMethod } from '../../../enums/paymentMethod.enum';

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

  @IsEnum(OrderDeliveryStatus)
  @IsOptional()
  deliveryStatus?: OrderDeliveryStatus;

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
