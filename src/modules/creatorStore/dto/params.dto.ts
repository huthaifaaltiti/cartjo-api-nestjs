import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Locale } from '../../../types/Locale';
import { validationConfig } from '../../../configs/validationConfig';

const { handlePattern } = validationConfig.creatorStore;

export class LangDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class IdParamDto {
  @IsMongoId({ message: 'Invalid store ID format' })
  @IsNotEmpty({ message: 'Store ID is required' })
  id: string;
}

export class HandleParamDto {
  @IsString()
  @IsNotEmpty({ message: 'Store handle is required' })
  @Matches(handlePattern, { message: 'Invalid store handle' })
  handle: string;
}
