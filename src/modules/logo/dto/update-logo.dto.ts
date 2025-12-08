import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';
import { Locale } from 'src/types/Locale';

const { nameMinChars, nameMaxChars, altMaxChars, altMinChars } =
  validationConfig.logo;

export class UpdateLogoParamsDto {
  @IsMongoId({ message: 'Invalid logo ID format' })
  @IsNotEmpty({ message: 'Logo ID is required' })
  id: string;
}

export class UpdateLogoDto {
  @IsString()
  @IsOptional()
  @MinLength(nameMinChars, {
    message: `Logo name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Logo name cannot be more than (${nameMaxChars}) characters`,
  })
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(altMinChars, {
    message: `Logo descriptive text cannot be less than (${altMinChars}) characters`,
  })
  @MaxLength(altMaxChars, {
    message: `Logo descriptive text cannot be more than (${altMaxChars}) characters`,
  })
  altText: string;

  @IsString()
  lang: Locale;
}
