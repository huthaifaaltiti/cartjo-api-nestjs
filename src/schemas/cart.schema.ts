import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop([
    {
      productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
    },
  ])
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];

  @Prop({ default: 0 })
  totalAmount: number;

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

export const CartSchema = SchemaFactory.createForClass(Cart);
