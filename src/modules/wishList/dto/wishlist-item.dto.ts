import mongoose from 'mongoose';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Locale } from '../../../types/Locale';

export class WishListItemBodyDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: mongoose.Types.ObjectId;

  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
export class SendWishListItemToCartBodyDto extends WishListItemBodyDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;
}
