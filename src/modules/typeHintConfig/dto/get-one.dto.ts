import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';
export class GetOneQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
export class GetOneParamDto {
  @IsMongoId({ message: 'Invalid Banner ID format' })
  @IsNotEmpty({ message: 'Banner ID is required' })
  id: string;
}
