import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExportFormat } from 'src/enums/ExportFormat.enum';
import { Locale } from 'src/types/Locale';

export class ExportOrdersQueryDto {
  @ApiPropertyOptional({ enum: ExportFormat })
  @IsEnum(ExportFormat)
  @IsOptional()
  format?: ExportFormat = ExportFormat.EXCEL;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  lang?: Locale = 'en';
}