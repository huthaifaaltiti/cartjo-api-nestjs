import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { validationConfig } from '../../../configs/validationConfig';
import { Locale } from '../../../types/Locale';
import { LogoType } from '../../../enums/logoType.enum';

const { nameMinChars, nameMaxChars, altMaxChars, altMinChars } =
  validationConfig.logo;

export class CreateLogoDto {
  @IsString()
  @IsNotEmpty({ message: 'Logo name (ar) is required' })
  @MinLength(nameMinChars, {
    message: `Logo (ar) name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Logo (ar) name cannot be more than (${nameMaxChars}) characters`,
  })
  name_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Logo name (en) is required' })
  @MinLength(nameMinChars, {
    message: `Logo (en) name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Logo (en) name cannot be more than (${nameMaxChars}) characters`,
  })
  name_en: string;

  @IsString()
  @IsNotEmpty({ message: 'Logo (ar) descriptive text is required' })
  @MinLength(altMinChars, {
    message: `Logo (ar) descriptive text cannot be less than (${altMinChars}) characters`,
  })
  @MaxLength(altMaxChars, {
    message: `Logo (ar) descriptive text cannot be more than (${altMaxChars}) characters`,
  })
  altText_ar: string;

  @IsString()
  @IsNotEmpty({ message: 'Logo (en) descriptive text is required' })
  @MinLength(altMinChars, {
    message: `Logo (en) descriptive text cannot be less than (${altMinChars}) characters`,
  })
  @MaxLength(altMaxChars, {
    message: `Logo (en) descriptive text cannot be more than (${altMaxChars}) characters`,
  })
  altText_en: string;

  @IsEnum(LogoType)
  type: LogoType;

  @IsString()
  lang: Locale;
}
