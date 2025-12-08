import { IsMongoId, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { CreateSubCategoryDto } from './create-subCategory.dto';

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) {}

export class UpdateSubCategoryParamsDto {
  @IsMongoId({ message: 'Invalid sub-category ID format' })
  @IsNotEmpty({ message: 'SubCategory ID is required' })
  id: string;
}
