import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { validationConfig } from '../../../configs/validationConfig';
import { Locale } from '../../../types/Locale';

const { titleMinChars, titleMaxChars } = validationConfig.banner;

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty({ message: 'Ar title is required' })
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'En title is required' })
  @MinLength(titleMinChars)
  @MaxLength(titleMaxChars)
  title_en: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'withAction flag is required' })
  @Transform(({ value }) => value === 'true')
  withAction: boolean;

  @IsString()
  @IsOptional()
  link: string;

  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
