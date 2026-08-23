import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from '../../../types/Locale';

export class UpdateCreatorsVideoStatusParamsDto {
  @IsMongoId({ message: 'Invalid video ID format' })
  @IsNotEmpty({ message: 'Video ID is required' })
  id: string;
}

export class UpdateCreatorsVideoStatusBodyDto {
  @IsBoolean()
  @IsNotEmpty({ message: 'isActive flag is required' })
  isActive: boolean;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
