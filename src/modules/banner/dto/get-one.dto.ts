import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetBannerQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}

export class GetBannerParamDto {
  @IsMongoId({ message: 'Invalid Banner ID format' })
  @IsNotEmpty({ message: 'Banner ID is required' })
  id: string;
}
