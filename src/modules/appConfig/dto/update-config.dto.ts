import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  @Min(1)
  handleChangeCooldownDays?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultCreatorStoreCommissionRate?: number;
}
