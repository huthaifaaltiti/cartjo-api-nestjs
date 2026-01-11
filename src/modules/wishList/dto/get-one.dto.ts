import { Transform } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetQueryDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;

    const num = Number(value);

    return isNaN(num) ? value : num;
  })
  limit?: number;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsOptional()
  @IsString()
  @IsMongoId()
  lastId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}