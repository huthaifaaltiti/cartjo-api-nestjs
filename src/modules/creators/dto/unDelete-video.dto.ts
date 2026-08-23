import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class UnDeleteCreatorsVideoParamsDto {
  @IsMongoId({ message: 'Invalid video ID format' })
  @IsNotEmpty({ message: 'Video ID is required' })
  id: string;
}

export class UnDeleteCreatorsVideoBodyDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
