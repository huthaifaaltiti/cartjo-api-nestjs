import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';

export type UserContextDocument = UserContext & Document;

class UserCounters {
  @Prop({ default: 0 })
  cartItemsCount: number;

  @Prop({ default: 0 })
  wishlistItemsCount: number;

  // @Prop({ default: 0 })
  // unreadNotificationsCount: number;

  @Prop({ default: 0 })
  activeOrdersCount: number;
}

class ShippingContext {
  @Prop()
  city?: string;

  @Prop()
  country?: string;
}

class UserFlags {
  @Prop({ default: false })
  hasActiveCart: boolean;

  @Prop({ default: false })
  hasActiveOrder: boolean;

  @Prop({ default: false })
  isProfileCompleted: boolean;
}

@Schema({
  collection: 'user_contexts',
  timestamps: true,
})
export class UserContext extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  profilePic?: string;

  @Prop({
    type: String,
    enum: Object.values(PreferredLanguage),
    default: PreferredLanguage.ARABIC,
  })
  preferredLang: PreferredLanguage;

  @Prop({ type: UserCounters, default: () => ({}) })
  counters: UserCounters;

  @Prop({ type: UserFlags, default: () => ({}) })
  flags: UserFlags;

  @Prop({ type: ShippingContext })
  shipping?: ShippingContext;

  @Prop({ default: Date.now })
  lastCalculatedAt: Date;
}

export const UserContextSchema =
  SchemaFactory.createForClass(UserContext);
