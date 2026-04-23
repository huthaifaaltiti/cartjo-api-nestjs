import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DefaultShippingAddress } from './user.schema';
import { MediaPreview, NameRef } from './common.schema';
import { VariantAttribute } from './sub-schemas/product-variant.schema';
import { Currency } from '../enums/currency.enum';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import { OrderDeliveryStatus } from '../enums/orderDeliveryStatus.enum';
import { OrderDeliveryByStatus } from '../enums/orderDeliveryByStatus.enum';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderVariantSnapshot {
  @Prop({ type: String })
  variantId: string;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: [VariantAttribute] })
  attributes: VariantAttribute[];

  @Prop({ type: NameRef })
  description: NameRef;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  discountRate: number;

  @Prop({ type: Number, required: true })
  priceAfterDiscount: number;

  @Prop({ type: Number, required: true })
  totalAmountCount: number;

  @Prop({ type: Number, required: true })
  availableCount: number;

  @Prop({ type: String, enum: Object.values(Currency), required: true })
  currency: Currency;

  @Prop({ type: Boolean, required: true })
  isActive: boolean;

  @Prop({ type: Boolean, required: true })
  isDeleted: boolean;

  @Prop({ type: Boolean, required: true })
  isAvailable: boolean;

  @Prop({ type: MediaPreview })
  mainImage: MediaPreview;
}

@Schema({ _id: false })
export class OrderItemSnapshot {
  @Prop({ type: mongoose.Types.ObjectId })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  variantId: string;

  @Prop({ type: NameRef })
  name: NameRef;

  @Prop({ type: NameRef })
  description: NameRef;

  @Prop({ type: MediaPreview })
  mainImage: MediaPreview;

  @Prop({ type: OrderVariantSnapshot })
  variant: OrderVariantSnapshot;

  @Prop({ type: Number })
  quantity: number;
}

@Schema({ _id: false })
export class OrderCartItem {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Product', required: true })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  variantId: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ type: NameRef, required: true })
  name: NameRef;
}

export const OrderCartItemSchema = SchemaFactory.createForClass(OrderCartItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: [OrderItemSnapshot], required: true, default: [] })
  orderItemsSnapshots: OrderItemSnapshot[];

  @Prop({ type: [OrderCartItemSchema], required: true, default: [] })
  items: OrderCartItem[];

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  deliveryCost: number;

  @Prop({ required: true })
  currency: Currency;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop()
  paymentMethod: string;

  @Prop()
  transactionId: string;

  @Prop()
  email: string;

  @Prop()
  merchantReference: string;

  @Prop({ type: DefaultShippingAddress, required: true })
  shippingAddress: DefaultShippingAddress;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ default: false })
  isDelivered: boolean;

  @Prop({ type: Date, default: null })
  deliveredAt: Date | null;

  @Prop({ enum: OrderDeliveryStatus, default: OrderDeliveryStatus.PENDING })
  deliveryStatus: OrderDeliveryStatus;

  @Prop({
    enum: OrderDeliveryByStatus,
    default: OrderDeliveryByStatus.OUTSOURCED,
  })
  deliveredByStatus: OrderDeliveryByStatus;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isUpdated: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: Date, default: null })
  updatedAt?: Date;

  @Prop({ type: Date, default: null })
  restoredAt?: Date;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', default: null })
  deletedBy?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', default: null })
  restoredBy?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', default: null })
  createdBy?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', default: null })
  updatedBy?: mongoose.Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
