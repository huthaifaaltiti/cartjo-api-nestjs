import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UnDeleteProductBodyDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class UnDeleteProductParamsDto {
  @IsMongoId({ message: 'Invalid product ID format' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: string;
}
