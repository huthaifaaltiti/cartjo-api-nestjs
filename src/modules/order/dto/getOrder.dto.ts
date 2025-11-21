import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetOrderQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}

export class GetOrderParamDto {
  @IsMongoId({ message: 'Invalid order ID format' })
  @IsNotEmpty({ message: 'Order ID is required' })
  id: string;
}
