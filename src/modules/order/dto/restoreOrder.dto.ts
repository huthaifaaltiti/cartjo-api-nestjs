import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class RestoreOrderBodyDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class RestoreOrderParamsDto {
  @IsMongoId({ message: 'Invalid order ID format' })
  @IsNotEmpty({ message: 'Order ID is required' })
  id: string;
}
