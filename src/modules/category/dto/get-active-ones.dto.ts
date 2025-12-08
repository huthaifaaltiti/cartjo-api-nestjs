import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
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
