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
import { LogoType } from '../../../enums/logoType.enum';

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
    message: `Logo (ar) name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Logo (ar) name cannot be more than (${nameMaxChars}) characters`,
  })
  name_ar?: string;

  @IsString()
  @IsOptional()
  @MinLength(nameMinChars, {
    message: `Logo (en) name cannot be less than (${nameMinChars}) characters`,
  })
  @MaxLength(nameMaxChars, {
    message: `Logo (en) name cannot be more than (${nameMaxChars}) characters`,
  })
  name_en?: string;

  @IsString()
  @IsOptional()
  @MinLength(altMinChars, {
    message: `Logo (ar) descriptive text cannot be less than (${altMinChars}) characters`,
  })
  @MaxLength(altMaxChars, {
    message: `Logo (ar) descriptive text cannot be more than (${altMaxChars}) characters`,
  })
  altText_ar?: string;

  @IsString()
  @IsOptional()
  @MinLength(altMinChars, {
    message: `Logo (en) descriptive text cannot be less than (${altMinChars}) characters`,
  })
  @MaxLength(altMaxChars, {
    message: `Logo (en) descriptive text cannot be more than (${altMaxChars}) characters`,
  })
  altText_en?: string;

  @IsEnum(LogoType)
  @IsOptional()
  type?: LogoType;

  @IsString()
  lang: Locale;
}
