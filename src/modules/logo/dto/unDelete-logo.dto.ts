import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class UnDeleteLogoBodyDto {
  @IsOptional()
  @IsString()
  lang?: Locale = 'en';
}

export class UnDeleteLogoParamsDto {
  @IsMongoId({ message: 'Invalid Logo ID format' })
  @IsNotEmpty({ message: 'Logo ID is required' })
  id: string;
}
