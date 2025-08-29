import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { WishListService } from './wishList.service';
import { AuthGuard } from '@nestjs/passport';
import { GetQueryDto } from './dto/get-one.dto';
import { AddWishListItemBodyDto } from './dto/add-wishlist-item.dto';
// import { AddWishListItemDto } from './dto/add-wishlist-item.dto';

@Controller('/api/v1/wish-list')
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
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
  @Post('add')
  async addWishListItem(
    @Body() dto: AddWishListItemBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.wishListService.addWishListItem(user, dto);
  }

  // // ✅ Remove one product
  // @UseGuards(AuthGuard('jwt'))
  // @Delete('remove/:productId')
  // async removeWishListItem(
  //   @Param('productId') productId: string,
  //   @Request() req: any,
  // ) {
  //   return this.wishListService.removeWishListItem(req.user, productId);
  // }

  // // ✅ Remove all
  // @UseGuards(AuthGuard('jwt'))
  // @Delete('remove-all')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async removeAllWishListItems(@Request() req: any) {
  //   return this.wishListService.removeAllWishListItems(req.user);
  // }
}
