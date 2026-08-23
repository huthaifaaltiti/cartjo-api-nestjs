import {
  IsEnum,
  IsMongoId,
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

export class UpdateCreatorsVideoParamsDto {
  @IsMongoId({ message: 'Invalid video ID format' })
  @IsNotEmpty({ message: 'Video ID is required' })
  id: string;
}

export class UpdateCreatorsVideoDto {
  @IsEnum(CreatorsVideoType)
  @IsOptional()
  type?: CreatorsVideoType;
  @IsString()
  @IsOptional()
  @MinLength(titleMinChars, {
    message: `Arabic title must be at least ${titleMinChars} characters long`,
  })
  @MaxLength(titleMaxChars, {
    message: `Arabic title cannot exceed ${titleMaxChars} characters`,
  })
  title_ar?: string;

  @IsString()
  @IsOptional()
  @MinLength(titleMinChars, {
    message: `English title must be at least ${titleMinChars} characters long`,
  })
  @MaxLength(titleMaxChars, {
    message: `English title cannot exceed ${titleMaxChars} characters`,
  })
  title_en?: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
