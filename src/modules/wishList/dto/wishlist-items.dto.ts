import { PartialType } from '@nestjs/mapped-types';
import { WishListItemBodyDto } from './wishlist-item.dto';
import { IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/types/Locale';

export class WishListItemsBodyDto extends PartialType(WishListItemBodyDto) {}

export class SendAllWishListItemsBodyDto {
  @IsString()
  @IsOptional()
  lang: Locale = 'en';
}
