import mongoose from 'mongoose';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class WishListItemBodyDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: mongoose.Types.ObjectId;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}


