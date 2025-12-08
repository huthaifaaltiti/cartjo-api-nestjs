import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateSubCategoryStatusParamsDto {
  @IsMongoId({ message: 'Invalid SubCategory ID format' })
  @IsNotEmpty({ message: 'SubCategory ID is required' })
  id: string;
}

export class UpdateSubCategoryStatusBodyDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
