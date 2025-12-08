import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetProductQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}

export class GetProductParamDto {
  @IsMongoId({ message: 'Invalid Product ID format' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: string;
}
