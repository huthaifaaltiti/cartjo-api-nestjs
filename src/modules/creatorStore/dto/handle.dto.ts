import { IsOptional, IsString, Matches } from 'class-validator';
import { Locale } from '../../../types/Locale';
import { validationConfig } from '../../../configs/validationConfig';

const c = validationConfig.creatorStore;

export class ChangeHandleDto {
  @IsString()
  @Matches(c.handlePattern, {
    message:
      'Handle must be 3-30 chars: lowercase letters, numbers, dashes or underscores',
  })
  handle: string;

  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}
