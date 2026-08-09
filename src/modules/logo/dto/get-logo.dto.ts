import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Locale } from '../../../types/Locale';
import { Locale as LocaleEnum } from '../../../enums/locale.enum';
import { LogoType } from '../../../enums/logoType.enum';

export class GetLogoQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = LocaleEnum.EN;

  @IsOptional()
  @IsEnum(LogoType)
  type?: LogoType;
}

export class GetLogoParamDto {
  @IsMongoId({ message: 'Invalid Logo ID format' })
  @IsNotEmpty({ message: 'Logo ID is required' })
  id: string;
}
