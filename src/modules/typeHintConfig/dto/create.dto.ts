import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Locale } from 'src/types/Locale';
import { validationConfig } from 'src/configs/validationConfig';

const { labelMinChars, labelMaxChars, priorityMinNum, priorityMaxNum } =
  validationConfig.typeHint;

export class CreateDto {
  @IsString()
  @IsNotEmpty({ message: 'Type hint AR label is required' })
  @MinLength(labelMinChars)
  @MaxLength(labelMaxChars)
  label_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Type hint EN label is required' })
  @MinLength(labelMinChars)
  @MaxLength(labelMaxChars)
  label_en: string;

  @IsNumber()
  @Min(priorityMinNum)
  @Max(priorityMaxNum)
  @IsNotEmpty({ message: 'Type hint priority is required' })
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;

    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  priority: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Type hint start date must be a valid date string' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Type hint end date must be a valid date string' },
  )
  endDate?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
