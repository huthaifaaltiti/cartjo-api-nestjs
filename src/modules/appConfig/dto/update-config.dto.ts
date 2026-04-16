import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  minActiveCategories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxProductsPerSubCategory?: number;

  @IsOptional()
  @IsBoolean()
  allowCategoryDeletion?: boolean;
}
