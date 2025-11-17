import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { DataResponse } from 'src/types/service-response.type';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import { ProcessPaymentBodyDto, VerifyPaymentBodyDto } from './dto/payment.dto';
import { getMessage } from 'src/common/utils/translator';
import { generateRandomString } from 'src/common/utils/generateRandomString';
import { CheckoutBodyDto } from './dto/checkout.dto';
import { Currency } from 'src/enums/currency.enum';
import { Locale } from 'src/types/Locale';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { OrderService } from '../order/order.service';

interface TokenizationPayload {
  service_command: string;
  language: string;
  merchant_identifier: string;
  access_code: string;
  merchant_reference: string;
  return_url?: string;
  signature?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly orderService: OrderService,
  ) {}

  private readonly accessCode = process.env.APS_PAY_FORT_ACCESS_CODE;
  private readonly merchantIdentifier =
    process.env.APS_PAY_FORT_MERCHANT_IDENTIFIER;
  private readonly shaRequestPhrase =
    process.env.APS_PAY_FORT_SHA_REQUEST_PHRASE;
  private readonly shaResponsePhrase =
    process.env.APS_PAY_FORT_SHA_RESPONSE_PHRASE;
  private readonly paymentApiUrl = process.env.APS_PAY_FORT_PAYMENT_API_URL;
  private readonly paymentReturnUrl =
    process.env.APS_PAY_FORT_PAYMENT_RETURN_URL;

  private decryptOrderDetails(
    encryptedText: string,
    secretKey: string,
  ): string {
    const [ivStr, content] = encryptedText.split(':');

    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = Buffer.from(ivStr, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(content, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Generate APS signature
  private generateSignature(
    params: Record<string, any>,
    requestPhrase: string,
  ): string {
    const sortedKeys = Object.keys(params).sort();
    const concatenatedParams = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('');
    const stringToHash = requestPhrase + concatenatedParams + requestPhrase;
    const sha256Hash = crypto
      .createHash('sha256')
      .update(stringToHash)
      .digest('hex');

    return sha256Hash;
  }

  // Encrypt order details
  private encryptOrderDetails(text: string, secretKey: string): string {
    const iv = crypto.randomBytes(16); // Initialization vector
    const key = crypto.createHash('sha256').update(secretKey).digest(); // 32-byte key

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Return iv + encrypted payload
    return iv.toString('base64') + ':' + encrypted;
  }

  // Convert JOD → minor units
  private toMinorUnits(amount: number, currency: string): number {
    let multiplier = 100; // default for 2-decimal currencies

    if (currency === Currency.JOD) multiplier = 1000;
    else if (currency === Currency.USD) multiplier = 100;

    let minor = Math.round(amount * multiplier);

    // If JOD, ensure last digit is 0 (VISA requirement)
    if (currency === Currency.JOD) {
      minor = Math.round(minor / 10) * 10;
    }

    return minor;
  }

  private async validateUser(
    requestingUser: any,
    checkCartItems = false,
    lang: Locale = 'en',
  ): Promise<{ valid: boolean; message?: string; cart?: CartDocument }> {
    if (!requestingUser) {
      return {
        valid: false,
        message: getMessage('payment_notFoundUserOrUnauthorized', lang),
      };
    }

    if (checkCartItems) {
      const cart = await this.cartModel.findOne({
        userId: requestingUser.userId,
      });

      if (!cart || !cart.items.length) {
        throw new BadRequestException(getMessage('cart_cartWithNoItems', lang));
      }

      return { valid: true, cart };
    }

    return { valid: true };
  }

  async processPayment(
    requestingUser: any,
    dto: ProcessPaymentBodyDto,
  ): Promise<DataResponse<any>> {
    const { lang, currency, amount, customer_email } = dto;

    const check = await this.validateUser(requestingUser, true, lang);
    if (!check.valid) {
      return { isSuccess: false, message: check.message, data: null };
    }

    const paymentPayload: TokenizationPayload = {
      service_command: 'TOKENIZATION',
      language: lang || 'en',
      merchant_identifier: this.merchantIdentifier,
      access_code: this.accessCode,
      merchant_reference: generateRandomString(8),
    };

    const orderDetailsString = amount + ',' + currency + ',' + customer_email;
    const encryptedOrderDetails = this.encryptOrderDetails(
      orderDetailsString,
      this.shaRequestPhrase,
    );

    paymentPayload.return_url = `${this.paymentReturnUrl}=${encodeURIComponent(encryptedOrderDetails)}`;

    paymentPayload.signature = this.generateSignature(
      paymentPayload,
      this.shaRequestPhrase,
    );

    return {
      isSuccess: true,
      message: getMessage('payment_processPayment', lang),
      data: paymentPayload,
    };
  }

  async verifyPayment(requestingUser: any, dto: VerifyPaymentBodyDto) {
    const { encryptedOrder, lang } = dto;

    const check = await this.validateUser(requestingUser, true, lang);
    if (!check.valid) {
      return { isSuccess: false, message: check.message, data: null };
    }

    const decrypted = this.decryptOrderDetails(
      encryptedOrder,
      this.shaRequestPhrase,
    );

    const [amount, currency, email] = decrypted.split(',');

    const orderDetails = {
      amount,
      currency,
      email,
    };

    return {
      isSuccess: true,
      message: getMessage('payment_verifyPayment', lang),
      data: orderDetails,
    };
  }

  async checkoutPayment(requestingUser: any, dto: CheckoutBodyDto) {
    const {
      card_number,
      expiry_date,
      card_security_code,
      card_holder_name,
      language,
      currency,
      amount,
      customer_email,
      merchant_reference,
      shippingAddress
    } = dto;

    const check = await this.validateUser(requestingUser, true, language);
    if (!check.valid) {
      return { isSuccess: false, message: check.message, data: null };
    }

    const cart = check.cart!;
    const amountVal = this.toMinorUnits(amount, currency);

    const paymentRequest: Record<string, any> = {
      command: 'PURCHASE',
      access_code: this.accessCode,
      merchant_identifier: this.merchantIdentifier,
      merchant_reference,
      amount: amountVal,
      currency,
      customer_email,
      language,
      card_number,
      card_holder_name,
      card_security_code,
      expiry_date: expiry_date.replace('/', ''), // "MMYY"
    };

    paymentRequest.signature = this.generateSignature(
      paymentRequest,
      this.shaRequestPhrase,
    );

    const response = await fetch(this.paymentApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentRequest),
    });

    const result = await response.json();

    if (!result.response_code.startsWith('14')) {
      return {
        isSuccess: false,
        message: result.response_message,
        data: result,
      };
    }

    // Create order
    const order = await this.orderService.createOrderAndClearCart(
      requestingUser.userId,
      cart,
      amount,
      currency,
      customer_email,
      merchant_reference,
      result.fort_id,
      PaymentMethod.CARD,
      shippingAddress
    );

    return {
      isSuccess: true,
      message: getMessage('payment_successPayment', language),
      data: {
        fort_id: result.fort_id,
        amount: result.amount / 100,
        currency: result.currency,
        customer_email,
        merchant_reference,
        order,
      },
    };
  }
}
