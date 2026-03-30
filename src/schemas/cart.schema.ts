import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { NameRef } from './common.schema';

export type CartDocument = Cart & Document;

@Schema({ _id: false }) // _id: false prevents generating separate ObjectId for each item
export class CartItem {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Product', required: true })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  variantId: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: NameRef, required: true })
  name: NameRef;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ default: 0 })
  itemsCount: number;

  @Prop({ default: 0 })
  totalItemsCount: number;

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
