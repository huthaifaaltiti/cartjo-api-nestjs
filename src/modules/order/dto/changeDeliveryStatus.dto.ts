import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderDeliveryStatus } from 'src/enums/orderDeliveryStatus.enum';
import { Locale } from 'src/types/Locale';

export class changeDeliveryStatusBodyDto {
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
