import { PartialType } from '@nestjs/mapped-types';
import { WishListItemBodyDto } from './wishlist-item.dto';

export class WishListItemsBodyDto extends PartialType(
  WishListItemBodyDto,
) {}
