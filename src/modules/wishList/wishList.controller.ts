import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { WishListService } from './wishList.service';
import { AuthGuard } from '@nestjs/passport';
import { GetQueryDto } from './dto/get-one.dto';
import { WishListItemBodyDto } from './dto/wishlist-item.dto';
import { WishListItemsBodyDto } from './dto/wishlist-items.dto';
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Wishlist.Root)
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Wishlist.GetWishlist)
  async getWishList(@Query() query: GetQueryDto, @Request() req: any) {
    const { lang, limit, lastId, search } = query;
    const { user } = req;

    return this.wishListService.getWishList(user, {
      lang,
      limit,
      lastId,
      search,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Wishlist.AddOne)
  async addWishListItem(@Body() dto: WishListItemBodyDto, @Request() req: any) {
    const { user } = req;

    return this.wishListService.addWishListItem(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Wishlist.RemoveOne)
  async removeWishListItem(
    @Body() dto: WishListItemBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.wishListService.removeWishListItem(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Wishlist.RemoveAll)
  async removeAllWishListItems(
    @Body() dto: WishListItemsBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.wishListService.removeAllWishListItems(user, dto);
  }
}
