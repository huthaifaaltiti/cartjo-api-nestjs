import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetLogoQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}

export class GetLogoParamDto {
  @IsMongoId({ message: 'Invalid Logo ID format' })
  @IsNotEmpty({ message: 'Logo ID is required' })
  id: string;
}
