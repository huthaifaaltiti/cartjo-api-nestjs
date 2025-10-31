import { IsMongoId, IsNumber, IsOptional, Min, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { Locale } from 'src/types/Locale';

export class ItemBodyDto {
  @IsMongoId()
  productId: mongoose.Types.ObjectId;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  lang?: Locale;
}
