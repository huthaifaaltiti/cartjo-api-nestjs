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
import { AuthGuard } from '@nestjs/passport';
import { ApiPaths } from 'src/common/constants/api-paths';
import { GetQueryDto } from './dto/get-one.dto';
import { CartService } from './cart.service';
import { ItemBodyDto } from './dto/item.dto';
import { Locale } from 'src/types/Locale';
import { CheckoutBodyDto } from './dto/checkout.dto';

@Controller(ApiPaths.Cart.Root)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Cart.GetCart)
  async getCart(@Query() query: GetQueryDto, @Request() req: any) {
    const { user } = req;

    return this.cartService.getCart(user, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Cart.AddOne)
  async addCartItem(@Body() dto: ItemBodyDto, @Request() req: any) {
    const { user } = req;

    return this.cartService.addCartItem(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Cart.RemoveOne)
  async removeCartItem(@Body() dto: ItemBodyDto, @Request() req: any) {
    const { user } = req;

    return this.cartService.removeCartItem(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Cart.RemoveAll)
  async removeAllCartItems(@Body('lang') lang: Locale, @Request() req: any) {
    const { user } = req;

    return this.cartService.removeAllCartItems(user, lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Cart.Checkout)
  async checkoutCart(@Body() dto: CheckoutBodyDto, @Request() req: any) {
    const { user } = req;

    return this.cartService.processPayment(user, dto);
  }
}
