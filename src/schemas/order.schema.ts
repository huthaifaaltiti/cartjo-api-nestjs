import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { DefaultShippingAddress } from './user.schema';
import { NameRef } from './common.schema';
<<<<<<< HEAD
=======
import { OrderDeliveryByStatus } from 'src/enums/orderDeliveryByStatus.enum';
import { OrderDeliveryStatus } from 'src/enums/orderDeliveryStatus.enum';
import { Currency } from 'src/enums/currency.enum';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderCartItem {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Product', required: true })
  productId: mongoose.Types.ObjectId;

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

  @Prop({ type: [OrderCartItemSchema], required: true, default: [] })
  items: OrderCartItem[];

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
<<<<<<< HEAD
  currency: string;
=======
  currency: Currency;
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

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
<<<<<<< HEAD
=======
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
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
