import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiPaths } from 'src/common/constants/api-paths';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { ProcessPaymentBodyDto, VerifyPaymentBodyDto } from './dto/payment.dto';
import { CheckoutBodyDto } from './dto/checkout.dto';

@Controller(ApiPaths.Payment.Root)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Payment.ProcessPayment)
  async processPayment(
    @Body() dto: ProcessPaymentBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.paymentService.processPayment(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Payment.VerifyPayment)
  async verifyPayment(@Body() dto: VerifyPaymentBodyDto, @Request() req: any) {
    const { user } = req;

    return this.paymentService.verifyPayment(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Payment.Checkout)
  async checkoutPayment(@Body() dto: CheckoutBodyDto, @Request() req: any) {
    const { user } = req;

    return this.paymentService.checkoutPayment(user, dto);
  }
}
