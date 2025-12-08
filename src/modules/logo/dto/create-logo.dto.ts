import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { validationConfig } from 'src/configs/validationConfig';
import { Locale } from 'src/types/Locale';

const { nameMinChars, nameMaxChars, altMaxChars, altMinChars } =
  validationConfig.logo;

export class CreateLogoDto {
  @IsString()
  @IsNotEmpty({ message: 'Logo name is required' })
  @MinLength(nameMinChars, {
    message: `Logo name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Logo name cannot be more than (${nameMaxChars}) characters`,
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Logo descriptive text is required' })
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
