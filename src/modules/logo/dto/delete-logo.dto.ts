import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class DeleteLogoDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class DeleteLogoParamsDto {
  @IsMongoId({ message: 'Invalid Logo ID format' })
  @IsNotEmpty({ message: 'Logo ID is required' })
  id: string;
}
