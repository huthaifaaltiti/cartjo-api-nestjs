import {
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import mongoose from 'mongoose';
import { Locale } from 'src/types/Locale';

export class ItemBodyDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: mongoose.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  lang?: Locale;
}
