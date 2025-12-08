import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateProductStatusParamsDto {
  @IsMongoId({ message: 'Invalid Product ID format' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: string;
}

export class UpdateProductStatusBodyDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
