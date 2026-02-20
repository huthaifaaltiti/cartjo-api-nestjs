import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateProductDto, ProductVariantDto } from './create-product.dto';
import mongoose from 'mongoose';
export class UpdateProductBodyDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deletedImages?: string[];
}

export class UpdateProductParamsDto {
  @IsMongoId({ message: 'Invalid product ID format' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: mongoose.Types.ObjectId;
}
export class UpdateProductVariantParamsDto {
  @IsMongoId({ message: 'Invalid product ID format' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: mongoose.Types.ObjectId;

  @IsString({ message: 'Invalid product variant ID format' })
  @IsNotEmpty({ message: 'Product variant ID is required' })
  vid: string;
}
export class UpdateProductVariantBodyDto extends PartialType(
  ProductVariantDto,
) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deletedImages?: string[];
}
