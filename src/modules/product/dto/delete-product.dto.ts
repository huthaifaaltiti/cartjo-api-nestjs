import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class DeleteProductDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class DeleteProductParamsDto {
  @IsMongoId({ message: 'Invalid product ID format' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: string;
}
