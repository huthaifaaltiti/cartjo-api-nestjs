import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from '../../../types/Locale';
import { CreatorsVideoType } from '../../../enums/creatorsVideoType.enum';

export class GetCreatorsVideoParamDto {
  @IsMongoId({ message: 'Invalid video ID format' })
  @IsNotEmpty({ message: 'Video ID is required' })
  id: string;
}

export class GetCreatorsVideoQueryDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';

  @IsEnum(CreatorsVideoType)
  @IsOptional()
  type?: CreatorsVideoType;
}
