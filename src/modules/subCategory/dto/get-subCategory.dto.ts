import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class GetSubCategoryQueryDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}

export class GetSubCategoryParamDto {
  @IsMongoId({ message: 'Invalid SubCategory ID format' })
  @IsNotEmpty({ message: 'SubCategory ID is required' })
  id: string;
}
