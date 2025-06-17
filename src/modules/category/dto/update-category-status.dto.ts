import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateCategoryStatusParamsDto {
  @IsMongoId({ message: 'Invalid Category ID format' })
  @IsNotEmpty({ message: 'Category ID is required' })
  id: string;
}

export class UpdateCategoryStatusBodyDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
