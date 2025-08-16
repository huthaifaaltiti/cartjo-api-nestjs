import { IsMongoId, IsOptional, IsString, IsDateString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetAllQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  lastId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsOptional()
  @IsDateString()
  startDate?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsDateString()
  endDate?: string; // YYYY-MM-DD format
}
