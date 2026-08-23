import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';
import { CreatorsVideoType } from '../../../enums/creatorsVideoType.enum';

export class GetCreatorsVideosQueryDto {
  @IsEnum(CreatorsVideoType)
  @IsOptional()
  type?: CreatorsVideoType;
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  lastId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
