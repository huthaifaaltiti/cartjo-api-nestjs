import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { DefaultShippingAddress } from './user.schema';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({
    type: [
      { productId: String, name: String, price: Number, quantity: Number },
    ],
  })
  items: {
    productId: mongoose.Types.ObjectId;
    price: number;
    quantity: number;
  }[];

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

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

  @Prop({
    type: DefaultShippingAddress,
    required: true,
  })
  shippingAddress: DefaultShippingAddress;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

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
