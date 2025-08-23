import { Transform } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from 'src/types/Locale';
export class GetActiveOnesQueryDto {
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
}
export class GetParamDto {
  @IsMongoId({ message: 'Invalid Showcase ID format' })
  @IsNotEmpty({ message: 'Showcase ID is required' })
  id: string;
}
