import { Transform } from 'class-transformer';
import {
  IsMongoId,
<<<<<<< HEAD
  IsNotEmpty,
=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
<<<<<<< HEAD
import mongoose from 'mongoose';
=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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