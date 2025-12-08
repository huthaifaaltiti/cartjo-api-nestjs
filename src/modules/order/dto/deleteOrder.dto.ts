import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class DeleteOrderBodyDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class DeleteOrderParamsDto {
  @IsMongoId({ message: 'Invalid order ID format' })
  @IsNotEmpty({ message: 'Order ID is required' })
  id: string;
}
