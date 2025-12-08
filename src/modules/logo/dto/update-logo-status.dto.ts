import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UpdateLogoStatusParamsDto {
  @IsMongoId({ message: 'Invalid Logo ID format' })
  @IsNotEmpty({ message: 'Logo ID is required' })
  id: string;
}

export class UpdateLogoStatusBodyDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
