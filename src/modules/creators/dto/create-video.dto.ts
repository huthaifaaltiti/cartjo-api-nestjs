import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { validationConfig } from '../../../configs/validationConfig';
import { Locale } from '../../../types/Locale';
import { CreatorsVideoType } from '../../../enums/creatorsVideoType.enum';

const { titleMinChars, titleMaxChars } = validationConfig.creators;

export class CreateCreatorsVideoDto {
  @IsEnum(CreatorsVideoType)
  @IsOptional()
  type?: CreatorsVideoType = CreatorsVideoType.HERO;

  @IsString()
  @IsNotEmpty({ message: 'Arabic title is required' })
  @MinLength(titleMinChars, {
    message: `Arabic title must be at least ${titleMinChars} characters long`,
  })
  @MaxLength(titleMaxChars, {
    message: `Arabic title cannot exceed ${titleMaxChars} characters`,
  })
  title_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'English title is required' })
  @MinLength(titleMinChars, {
    message: `English title must be at least ${titleMinChars} characters long`,
  })
  @MaxLength(titleMaxChars, {
    message: `English title cannot exceed ${titleMaxChars} characters`,
  })
  title_en: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
