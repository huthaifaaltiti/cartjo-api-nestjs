import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty } from 'class-validator';

import { CreateProductDto } from './create-product.dto';

export class UpdateProductBodyDto extends PartialType(CreateProductDto) {}

export class UpdateProductParamsDto {
  @IsMongoId({ message: 'Invalid product ID format' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: string;
}
