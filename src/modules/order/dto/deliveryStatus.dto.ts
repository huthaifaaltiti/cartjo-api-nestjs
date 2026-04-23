import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { OrderDeliveryStatus } from '../../../enums/orderDeliveryStatus.enum';
import { Locale } from '../../../types/Locale';

export class ChangeDeliveryStatusBodyDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(OrderDeliveryStatus)
  @IsNotEmpty()
  status: OrderDeliveryStatus;

  @IsString()
  @IsOptional()
  lang: Locale;
}
