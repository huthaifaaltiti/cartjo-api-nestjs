import { PartialType } from '@nestjs/mapped-types';
import { WishListItemBodyDto } from './wishlist-item.dto';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';
import { Locale } from '../../../types/Locale';

export class SentWishlistItem {
  @IsMongoId()
  @IsNotEmpty()
  productId: mongoose.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  variantId: string;
}

export class WishListItemsBodyDto extends PartialType(WishListItemBodyDto) {}

export class SendAllWishListItemsBodyDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SentWishlistItem)
  items: SentWishlistItem[];
}
